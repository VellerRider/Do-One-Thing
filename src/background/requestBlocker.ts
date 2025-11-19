// Request Blocker - manages declarativeNetRequest rules for static allow/block lists

import { Storage } from '../services/storage';

export class RequestBlocker {
  private blockedPageURL: string;

  constructor() {
    this.blockedPageURL = chrome.runtime.getURL('blocked/index.html');
  }

  async initialize() {
    // Set up declarativeNetRequest rules dynamically
    await this.updateBlockingRules();
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
    
    session.rules.blockedDomains.forEach((domain: string, index: number) => {
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
