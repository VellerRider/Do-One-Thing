// Generic content filter for all websites

class EvaluationBadge {
  private element: HTMLDivElement | null = null;
  private stylesInjected = false;

  show() {
    if (this.element) return;
    if (typeof document === 'undefined') return;

    const mount = () => {
      this.injectStyles();
      const badge = document.createElement('div');
      badge.className = 'dot-eval-badge';
      badge.innerHTML = `
        <div class="dot-eval-spinner"></div>
        <span class="dot-eval-text">Evaluating...</span>
      `;
      document.body?.appendChild(badge);
      this.element = badge;
      
      requestAnimationFrame(() => {
        badge.classList.add('dot-visible');
        requestAnimationFrame(() => badge.classList.add('dot-pill'));
      });
    };

    if (document.body) {
      mount();
    } else {
      document.addEventListener('DOMContentLoaded', mount, { once: true });
    }
  }

  hide() {
    if (!this.element) return;
    const badge = this.element;
    const cleanup = () => {
      badge.removeEventListener('transitionend', cleanup);
      badge.remove();
    };
    badge.addEventListener('transitionend', cleanup);
    badge.classList.add('dot-hide');
    setTimeout(cleanup, 400);
    this.element = null;
  }

  private injectStyles() {
    if (this.stylesInjected || typeof document === 'undefined') return;
    const styleId = 'dot-eval-badge-styles';
    if (document.getElementById(styleId)) {
      this.stylesInjected = true;
      return;
    }
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .dot-eval-badge {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translate(-50%, 20px);
        background: rgba(31, 41, 55, 0.95);
        color: white;
        border-radius: 999px;
        padding: 10px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        z-index: 2147483647;
        pointer-events: none;
        opacity: 0;
        transition: transform 0.25s ease, opacity 0.25s ease, padding 0.25s ease;
        width: 40px;
        height: 40px;
        justify-content: center;
      }
      .dot-eval-badge.dot-visible {
        transform: translate(-50%, 0);
        opacity: 1;
      }
      .dot-eval-badge.dot-pill {
        padding: 8px 16px;
        width: auto;
        height: auto;
      }
      .dot-eval-badge.dot-hide {
        transform: translate(-50%, 20px);
        opacity: 0;
      }
      .dot-eval-spinner {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: white;
        animation: dot-eval-spin 0.8s linear infinite;
        flex-shrink: 0;
      }
      .dot-eval-text {
        opacity: 0;
        transition: opacity 0.2s ease;
        white-space: nowrap;
      }
      .dot-eval-badge.dot-pill .dot-eval-text {
        opacity: 1;
      }
      @keyframes dot-eval-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head?.appendChild(style);
    this.stylesInjected = true;
  }
}

export class ContentFilter {
  private sessionActive = false;
  private evaluationBadge = new EvaluationBadge();

  async initialize() {
    // Check if there's an active focus session
    const response = await chrome.runtime.sendMessage({
      type: 'GET_STATS',
    });
    
    if (response.success && response.session?.active) {
      this.sessionActive = true;
      
      // Check if current page is relevant before showing indicator
      await this.checkAndShowIndicator(response.session.intent);
    }
  }

  private async checkAndShowIndicator(intent: string) {
    // Check if current page is relevant to focus goal
    try {
      this.evaluationBadge.show();
      const checkResponse = await chrome.runtime.sendMessage({
        type: 'CHECK_URL',
        payload: {
          url: window.location.href,
          title: document.title,
        },
      });
      
      if (checkResponse.success && checkResponse.classification) {
        if (!checkResponse.classification.relevant) {
          this.redirectToBlockedPage(intent, checkResponse.classification.reason);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to check URL for indicator:', error);
      this.showFocusIndicator(intent);
    } finally {
      this.evaluationBadge.hide();
    }
  }

  private redirectToBlockedPage(intent: string, reason?: string) {
    const blockedPage = chrome.runtime.getURL('blocked/index.html');
    const target = `${blockedPage}?url=${encodeURIComponent(window.location.href)}&intent=${encodeURIComponent(intent)}&reason=${encodeURIComponent(reason || 'Not related to your focus goal')}`;
    window.location.replace(target);
  }

  private showFocusIndicator(intent: string) {
    // Wait for body to be available
    const addIndicator = () => {
      // Check if indicator already exists
      if (document.getElementById('dot-focus-indicator')) {
        return;
      }
      
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
    };
    
    // If body exists, add immediately; otherwise wait for DOM
    if (document.body) {
      addIndicator();
    } else {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addIndicator);
      } else {
        // DOM is already ready but body doesn't exist yet (rare case)
        setTimeout(addIndicator, 100);
      }
    }
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
