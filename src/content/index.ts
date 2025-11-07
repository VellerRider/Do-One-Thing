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

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SESSION_STARTED') {
    // Reload page to apply filters
    window.location.reload();
  } else if (message.type === 'SESSION_ENDED') {
    // Reload page to remove filters
    window.location.reload();
  }
  
  sendResponse({ success: true });
  return true;
});

export {};
