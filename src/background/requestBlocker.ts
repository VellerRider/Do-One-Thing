// Request Blocker - blocks network requests to irrelevant sites

import { Storage } from '../services/storage';
import { URLClassifier } from './urlClassifier';

export class RequestBlocker {
  private classifier: URLClassifier;
  private blockedPageURL: string;

  constructor(classifier: URLClassifier) {
    this.classifier = classifier;
    this.blockedPageURL = chrome.runtime.getURL('blocked/index.html');
  }

  async initialize() {
    // Set up declarativeNetRequest rules dynamically
    await this.updateBlockingRules();
    
    // Listen for navigation events
    chrome.webNavigation.onBeforeNavigate.addListener(
      this.handleNavigation.bind(this)
    );
  }

  private async handleNavigation(details: chrome.webNavigation.WebNavigationParentedCallbackDetails) {
    // Only handle main frame navigations
    if (details.frameId !== 0) return;
    
    // Don't block browser internal pages
    const url = details.url.toLowerCase();
    if (
      url.startsWith('chrome://') ||
      url.startsWith('chrome-extension://') ||
      url.startsWith('edge://') ||
      url.startsWith('about:') ||
      url === 'chrome://newtab/' ||
      url === 'edge://newtab/' ||
      url === 'about:newtab' ||
      url === 'about:blank'
    ) {
      return;
    }
    
    if (details.url.startsWith(this.blockedPageURL)) return;
    
    // Check if URL should be blocked
    const classification = await this.classifier.classifyURL({
      url: details.url,
    });
    
    if (!classification.relevant) {
      // Increment blocked count for current session
      const session = await Storage.getCurrentSession();
      if (session && session.active) {
        session.blockedCount = (session.blockedCount || 0) + 1;
        await Storage.setCurrentSession(session);
      }
      
      // Redirect to blocked page
      const blockedURL = `${this.blockedPageURL}?url=${encodeURIComponent(details.url)}&reason=${encodeURIComponent(classification.reason || 'Not relevant to your focus goal')}`;
      
      chrome.tabs.update(details.tabId, {
        url: blockedURL,
      });
    }
  }

  private async updateBlockingRules() {
    const session = await Storage.getCurrentSession();
    
    if (!session || !session.active) {
      // Clear all rules
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: await this.getAllRuleIds(),
      });
      return;
    }

    // Create rules for blocked domains
    const rules: chrome.declarativeNetRequest.Rule[] = [];
    
    session.rules.blockedDomains.forEach((domain, index) => {
      rules.push({
        id: index + 1,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
          redirect: {
            url: `${this.blockedPageURL}?url={url}&reason=Domain blocked`,
          },
        },
        condition: {
          urlFilter: `*://*.${domain}/*`,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
        },
      });
    });

    // Update rules
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: await this.getAllRuleIds(),
      addRules: rules,
    });
  }

  private async getAllRuleIds(): Promise<number[]> {
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    return rules.map(rule => rule.id);
  }

  async updateRules() {
    await this.updateBlockingRules();
  }
}
