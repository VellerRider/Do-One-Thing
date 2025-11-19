// Background Service Worker - Main entry point

import type { Message, StartSessionPayload, CheckURLPayload, FocusSession, FilterContentPayload } from '../services/types';
import { Storage } from '../services/storage';
import { aiService } from '../services/aiService';
import { URLClassifier } from './urlClassifier';
import { RequestBlocker } from './requestBlocker';
import { generateSessionId } from '../utils/helpers';

// Initialize modules
const classifier = new URLClassifier();
const blocker = new RequestBlocker();

let initPromise: Promise<void> | null = null;

// Initialize on install/startup
chrome.runtime.onInstalled.addListener(async () => {
  console.log('DoOneThing extension installed');
  await initialize();
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('DoOneThing extension starting up');
  await initialize();
});

async function initialize() {
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    try {
      await classifier.initialize();
      await blocker.initialize();
      await aiService.initialize();
      
      // Restore active session if exists
      const session = await Storage.getCurrentSession();
      if (session?.active) {
        console.log('Restored active focus session:', session.intent);
      }
      
      console.log('DoOneThing initialized successfully');
    } catch (error) {
      console.error('Failed to initialize:', error);
    }
  })();
  
  return initPromise;
}

// Message handler
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse).catch(error => {
    console.error('Message handling error:', error);
    sendResponse({ error: error.message });
  });
  
  return true; // Keep message channel open for async response
});

async function handleMessage(message: Message, _sender: chrome.runtime.MessageSender) {
  await initialize();
  
  switch (message.type) {
    case 'START_SESSION':
      return handleStartSession(message.payload as StartSessionPayload);
    
    case 'END_SESSION':
      return handleEndSession();
    
    case 'CHECK_URL':
      return handleCheckURL(message.payload as CheckURLPayload);
    
    case 'GET_STATS':
      return handleGetStats();
    
    case 'UPDATE_SETTINGS':
      return handleUpdateSettings(message.payload);
    
    case 'CLEAR_CACHE':
      return handleClearCache();
    
    case 'RELOAD_AI_CONFIG':
      return handleReloadAIConfig();
    
    case 'ALLOW_TEMPORARILY':
      return handleAllowTemporarily(message.payload);

    case 'FILTER_CONTENT':
      return handleFilterContent(message.payload as FilterContentPayload);
    
    default:
      throw new Error(`Unknown message type: ${message.type}`);
  }
}

async function handleStartSession(payload: StartSessionPayload) {
  await chrome.storage.local.set({ sessionStarting: true });
  
  try {
    console.log('Starting focus session:', payload.intent);
    
    // Clear URL classification cache for new session
    await Storage.clearURLCache();
    console.log('Cleared URL cache for new session');
    
    // Get user settings
    const settings = await Storage.getSettings();

    if (!settings.aiEnabled) {
      throw new Error('AI filtering is disabled. Enable it in Settings to start a focus session.');
    }

    if (!settings.dataSharingConsent) {
      throw new Error('Please consent to sending URLs to the AI service in Settings before starting.');
    }

    // Analyze intent with AI (for normalization)
    const analysis = await aiService.analyzeIntent(payload.intent);
    
    // Create session
    const session: FocusSession = {
      id: generateSessionId(),
      intent: analysis.intent,
      startTime: Date.now(),
      active: true,
      rules: {
        allowedDomains: [...settings.whitelist],
        blockedDomains: [...settings.blacklist],
        strictness: settings.strictness,
      },
      blockedCount: 0,
    };
    
    // Save session
    await Storage.setCurrentSession(session);
    await classifier.setSession(session);
    await blocker.updateRules();
    
    console.log('Focus session started successfully');
    
    return {
      success: true,
      session,
    };
  } catch (error: any) {
    console.error('Failed to start session:', error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await chrome.storage.local.set({ sessionStarting: false });
  }
}

async function handleEndSession() {
  try {
    const session = await Storage.getCurrentSession();
    
    if (session) {
      // Calculate session duration
      const duration = Date.now() - session.startTime;
      
      // Update stats
      const stats = await Storage.getStats();
      stats.totalFocusTime += duration;
      stats.sessionsCompleted += 1;
      await Storage.updateStats(stats);
      
      // Save to history
      session.active = false;
      session.endTime = Date.now();
      await Storage.addSession(session);
    }
    
    // Clear current session
    await Storage.setCurrentSession(null);
    await classifier.setSession(null);
    await blocker.updateRules();
    
    console.log('Focus session ended');
    
    return { success: true };
  } catch (error: any) {
    console.error('Failed to end session:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

async function handleCheckURL(payload: CheckURLPayload) {
  try {
    const classification = await classifier.classifyURL(payload);
    return {
      success: true,
      classification,
    };
  } catch (error: any) {
    console.error('Failed to check URL:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

async function handleGetStats() {
  try {
    const stats = await Storage.getStats();
    const session = await Storage.getCurrentSession();
    const settings = await Storage.getSettings();
    
    return {
      success: true,
      stats,
      session,
      settings,
    };
  } catch (error: any) {
    console.error('Failed to get stats:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

async function handleUpdateSettings(settings: any) {
  try {
    await Storage.updateSettings(settings);
    
    // Update classifier with new settings
    await classifier.initialize();
    await blocker.updateRules();
    await aiService.initialize();
    
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update settings:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

async function handleClearCache() {
  try {
    await Storage.clearURLCache();
    return { success: true };
  } catch (error: any) {
    console.error('Failed to clear cache:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

async function handleReloadAIConfig() {
  try {
    await aiService.initialize();
    console.log('AI config reloaded');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to reload AI config:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

async function handleAllowTemporarily(payload: any) {
  try {
    const { url } = payload;
    
    // Add URL to temporary whitelist for current session
    const session = await Storage.getCurrentSession();
    if (!session || !session.active) {
      return { success: false, error: 'No active session' };
    }
    
    // Extract domain from URL
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    
    // Add to allowed domains for this session
    if (!session.rules.allowedDomains.includes(domain)) {
      session.rules.allowedDomains.push(domain);
      await Storage.setCurrentSession(session);
      await classifier.setSession(session);
      
      console.log(`Temporarily allowed: ${domain}`);
    }
    
    return { 
      success: true,
      redirectUrl: url // Return URL to redirect to
    };
  } catch (error: any) {
    console.error('Failed to allow temporarily:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

async function handleFilterContent(payload: FilterContentPayload) {
  try {
    if (!payload.videos || payload.videos.length === 0) {
      return { success: true, videosToHide: [] };
    }

    const checkPayloads: CheckURLPayload[] = payload.videos.map(video => ({
      url: `https://www.youtube.com/watch?v=${video.id}`,
      title: [video.title, video.channelName].filter(Boolean).join(' ').trim(),
    }));

    const results = await classifier.batchClassifyURLs(checkPayloads);
    const videosToHide = results
      .filter(result => !result.relevant)
      .map(result => {
        try {
          const videoUrl = new URL(result.url);
          return videoUrl.searchParams.get('v') || result.url;
        } catch {
          return result.url;
        }
      });

    return { success: true, videosToHide };
  } catch (error: any) {
    console.error('Failed to filter content:', error);
    return {
      success: false,
      error: error.message,
      videosToHide: [],
    };
  }
}

export {};
