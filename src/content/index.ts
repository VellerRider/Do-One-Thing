// Content Script - Main entry point

import { YouTubeFilter } from './youtube';
import { ContentFilter } from './contentFilter';

console.log('DoOneThing content script loaded');

const isYouTube = window.location.hostname.includes('youtube.com');

// Initialize appropriate filter
if (isYouTube) {
  const youtubeFilter = new YouTubeFilter();
  youtubeFilter.initialize();
} else {
  const contentFilter = new ContentFilter();
  contentFilter.initialize();
  contentFilter.filterPage();
}

// Refresh page when session state changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local' || !changes.currentSession) return;
  
  const { oldValue, newValue } = changes.currentSession;
  const oldActive = Boolean(oldValue?.active);
  const newActive = Boolean(newValue?.active);
  
  if (oldActive !== newActive) {
    window.location.reload();
  }
});

export {};
