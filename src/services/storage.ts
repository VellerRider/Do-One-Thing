// Chrome Storage wrapper with type safety

import type { StorageData, FocusSession, AIConfig, URLClassification, Stats, UserSettings } from './types';

const DEFAULT_SETTINGS: UserSettings = {
  strictness: 'standard',
  whitelist: [],
  blacklist: [],
  showStats: true,
  notificationsEnabled: true,
  aiEnabled: true,
};

const DEFAULT_STATS: Stats = {
  totalBlocked: 0,
  websitesBlocked: {},
  totalFocusTime: 0,
  sessionsCompleted: 0,
  lastUpdated: Date.now(),
};

export class Storage {
  // Get current focus session
  static async getCurrentSession(): Promise<FocusSession | null> {
    const data = await chrome.storage.local.get('currentSession');
    return data.currentSession || null;
  }

  // Set current focus session
  static async setCurrentSession(session: FocusSession | null): Promise<void> {
    await chrome.storage.local.set({ currentSession: session });
  }

  // Get AI configuration
  static async getAIConfig(): Promise<AIConfig | null> {
    const data = await chrome.storage.local.get('aiConfig');
    return data.aiConfig || null;
  }

  // Set AI configuration
  static async setAIConfig(config: AIConfig): Promise<void> {
    await chrome.storage.local.set({ aiConfig: config });
  }

  // URL Cache operations
  static async getURLClassification(url: string): Promise<URLClassification | null> {
    const data = await chrome.storage.local.get('urlCache');
    const cache = data.urlCache || {};
    
    const cached = cache[url];
    if (!cached) return null;
    
    // Check if cache is expired (1 hour)
    const isExpired = Date.now() - cached.timestamp > 60 * 60 * 1000;
    if (isExpired) {
      await this.removeURLClassification(url);
      return null;
    }
    
    return cached;
  }

  static async setURLClassification(classification: URLClassification): Promise<void> {
    const data = await chrome.storage.local.get('urlCache');
    const cache = data.urlCache || {};
    
    cache[classification.url] = classification;
    
    // Limit cache size (LRU)
    const entries = Object.entries(cache) as [string, URLClassification][];
    if (entries.length > 1000) {
      // Remove oldest 200 entries
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toKeep = entries.slice(200);
      const newCache: Record<string, URLClassification> = {};
      toKeep.forEach(([url, data]) => {
        newCache[url] = data;
      });
      await chrome.storage.local.set({ urlCache: newCache });
    } else {
      await chrome.storage.local.set({ urlCache: cache });
    }
  }

  static async removeURLClassification(url: string): Promise<void> {
    const data = await chrome.storage.local.get('urlCache');
    const cache = data.urlCache || {};
    delete cache[url];
    await chrome.storage.local.set({ urlCache: cache });
  }

  static async clearURLCache(): Promise<void> {
    await chrome.storage.local.set({ urlCache: {} });
  }

  // Stats operations
  static async getStats(): Promise<Stats> {
    const data = await chrome.storage.local.get('stats');
    return data.stats || DEFAULT_STATS;
  }

  static async updateStats(updates: Partial<Stats>): Promise<void> {
    const currentStats = await this.getStats();
    const newStats = { ...currentStats, ...updates, lastUpdated: Date.now() };
    await chrome.storage.local.set({ stats: newStats });
  }

  static async incrementBlockedCount(domain: string): Promise<void> {
    const stats = await this.getStats();
    stats.totalBlocked += 1;
    stats.websitesBlocked[domain] = (stats.websitesBlocked[domain] || 0) + 1;
    stats.lastUpdated = Date.now();
    await chrome.storage.local.set({ stats });
  }

  static async resetStats(): Promise<void> {
    await chrome.storage.local.set({ stats: DEFAULT_STATS });
  }

  // Settings operations
  static async getSettings(): Promise<UserSettings> {
    const data = await chrome.storage.local.get('settings');
    return data.settings || DEFAULT_SETTINGS;
  }

  static async updateSettings(updates: Partial<UserSettings>): Promise<void> {
    const currentSettings = await this.getSettings();
    const newSettings = { ...currentSettings, ...updates };
    await chrome.storage.local.set({ settings: newSettings });
  }

  // Session history
  static async getSessions(): Promise<FocusSession[]> {
    const data = await chrome.storage.local.get('sessions');
    return data.sessions || [];
  }

  static async addSession(session: FocusSession): Promise<void> {
    const sessions = await this.getSessions();
    sessions.push(session);
    
    // Keep only last 50 sessions
    if (sessions.length > 50) {
      sessions.shift();
    }
    
    await chrome.storage.local.set({ sessions });
  }

  // Clear all data
  static async clearAll(): Promise<void> {
    await chrome.storage.local.clear();
  }

  // Export data
  static async exportData(): Promise<StorageData> {
    const data = await chrome.storage.local.get(null);
    return data as StorageData;
  }

  // Import data
  static async importData(data: Partial<StorageData>): Promise<void> {
    await chrome.storage.local.set(data);
  }
}
