// Core type definitions for DoOneThing

export interface FocusSession {
  id: string;
  intent: string;
  startTime: number;
  endTime?: number;
  active: boolean;
  rules: ClassificationRules;
}

export interface ClassificationRules {
  keywords: string[];
  allowedCategories: string[];
  blockedCategories: string[];
  allowedDomains: string[];
  blockedDomains: string[];
  strictness: StrictnessLevel;
}

export type StrictnessLevel = 'relaxed' | 'standard' | 'strict';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  enabled: boolean;
}

export type AIProvider = 'openai' | 'claude' | 'local';

export interface URLClassification {
  url: string;
  relevant: boolean;
  confidence: number;
  reason?: string;
  timestamp: number;
  source: 'cache' | 'rules' | 'ai';
}

export interface ContentFilterResult {
  shouldBlock: boolean;
  reason?: string;
  elements?: string[]; // CSS selectors to hide
}

export interface IntentAnalysisResult {
  intent: string;
  keywords: string[];
  allowedCategories: string[];
  blockedCategories: string[];
  suggestedWebsites: string[];
  confidence: number;
}

export interface BlockedPageData {
  url: string;
  reason: string;
  intent: string;
  suggestedAlternatives: string[];
  timestamp: number;
}

export interface Stats {
  totalBlocked: number;
  websitesBlocked: Record<string, number>;
  totalFocusTime: number;
  sessionsCompleted: number;
  lastUpdated: number;
}

export interface UserSettings {
  strictness: StrictnessLevel;
  whitelist: string[];
  blacklist: string[];
  showStats: boolean;
  notificationsEnabled: boolean;
  aiEnabled: boolean;
}

export interface StorageData {
  currentSession?: FocusSession;
  aiConfig?: AIConfig;
  urlCache: Record<string, URLClassification>;
  stats: Stats;
  settings: UserSettings;
  sessions: FocusSession[];
}

// Message types for communication between components
export type MessageType =
  | 'START_SESSION'
  | 'END_SESSION'
  | 'CHECK_URL'
  | 'FILTER_CONTENT'
  | 'UPDATE_SETTINGS'
  | 'GET_STATS'
  | 'CLEAR_CACHE';

export interface Message<T = any> {
  type: MessageType;
  payload?: T;
}

export interface StartSessionPayload {
  intent: string;
}

export interface CheckURLPayload {
  url: string;
  title?: string;
}

export interface FilterContentPayload {
  url: string;
  content: string;
  platform?: 'youtube' | 'generic';
}

// YouTube specific types
export interface YouTubeVideo {
  id: string;
  title: string;
  description?: string;
  channelName?: string;
  element: Element;
}

export interface YouTubeFilterResult {
  videosToHide: string[]; // video IDs
  videosToShow: string[];
}
