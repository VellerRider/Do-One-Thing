// Generic content filter for all websites

export class ContentFilter {
  private sessionActive = false;

  async initialize() {
    // Check if there's an active focus session
    const response = await chrome.runtime.sendMessage({
      type: 'GET_STATS',
    });
    
    if (response.success && response.session?.active) {
      this.sessionActive = true;
      this.showFocusIndicator(response.session.intent);
    }
  }

  private showFocusIndicator(intent: string) {
    // Create a subtle indicator that focus mode is active
    const indicator = document.createElement('div');
    indicator.id = 'dot-focus-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 12px;
      font-weight: 600;
      z-index: 999999;
      box-shadow: 0 2px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      transition: all 0.3s ease;
      opacity: 0.9;
    `;
    
    indicator.innerHTML = `
      <span style="margin-right: 6px;">🎯</span>
      <span>Focus: ${intent}</span>
    `;
    
    indicator.addEventListener('mouseenter', () => {
      indicator.style.opacity = '1';
      indicator.style.transform = 'scale(1.05)';
    });
    
    indicator.addEventListener('mouseleave', () => {
      indicator.style.opacity = '0.9';
      indicator.style.transform = 'scale(1)';
    });
    
    indicator.addEventListener('click', () => {
      // Open popup
      chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
    });
    
    document.body.appendChild(indicator);
  }

  async filterPage() {
    if (!this.sessionActive) return;
    
    // Generic filtering logic
    // This can be extended based on common patterns
    this.filterCommonDistractions();
  }

  private filterCommonDistractions() {
    // Hide common distraction elements
    const distractionSelectors = [
      '[aria-label*="Advertisement"]',
      '[class*="ad-container"]',
      '[class*="sponsored"]',
      '[id*="ads"]',
    ];
    
    distractionSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
    });
  }
}
