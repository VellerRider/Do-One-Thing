// URL Classifier - determines if URLs should be blocked

import type { FocusSession, URLClassification, CheckURLPayload } from '../services/types';
import { Storage } from '../services/storage';
import { aiService } from '../services/aiService';
import { extractDomain } from '../utils/helpers';

export class URLClassifier {
  private session: FocusSession | null = null;

  async initialize() {
    this.session = await Storage.getCurrentSession();
    if (this.session?.active) {
      await aiService.initialize();
    }
  }

  async setSession(session: FocusSession | null) {
    this.session = session;
  }

  async classifyURL(payload: CheckURLPayload): Promise<URLClassification> {
    // Always allow browser new tab pages and internal pages
    const url = payload.url.toLowerCase();
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
      return {
        url: payload.url,
        relevant: true,
        confidence: 100,
        reason: 'Browser internal page',
        timestamp: Date.now(),
        source: 'rules',
      };
    }
    
    if (!this.session || !this.session.active) {
      // No active session, allow all
      return {
        url: payload.url,
        relevant: true,
        confidence: 100,
        reason: 'No active focus session',
        timestamp: Date.now(),
        source: 'rules',
      };
    }

    const { rules } = this.session;
    const domain = extractDomain(payload.url);

    // 1. Check whitelist
    if (this.isInWhitelist(domain, rules.allowedDomains)) {
      return {
        url: payload.url,
        relevant: true,
        confidence: 100,
        reason: 'Domain in whitelist',
        timestamp: Date.now(),
        source: 'rules',
      };
    }

    // 2. Check blacklist
    if (this.isInBlacklist(domain, rules.blockedDomains)) {
      await Storage.incrementBlockedCount(domain);
      return {
        url: payload.url,
        relevant: false,
        confidence: 100,
        reason: 'Domain in blacklist',
        timestamp: Date.now(),
        source: 'rules',
      };
    }

    // 3. Check cache
    const cached = await Storage.getURLClassification(payload.url);
    if (cached) {
      if (!cached.relevant) {
        await Storage.incrementBlockedCount(domain);
      }
      return cached;
    }

    // 4. AI classification based on intent only
    try {
      const aiResult = await aiService.classifyURL(
        payload,
        this.session.intent,
        rules.strictness
      );
      
      await Storage.setURLClassification(aiResult);
      
      if (!aiResult.relevant) {
        await Storage.incrementBlockedCount(domain);
      }
      
      return aiResult;
    } catch (error) {
      console.error('AI classification failed:', error);
      
      // Fallback: allow when uncertain to avoid blocking useful resources
      const fallbackRelevant = true;
      const result: URLClassification = {
        url: payload.url,
        relevant: fallbackRelevant,
        confidence: 40,
        reason: 'AI unavailable, allowing by default',
        timestamp: Date.now(),
        source: 'rules',
      };
      
      await Storage.setURLClassification(result);
      
      if (!fallbackRelevant) {
        await Storage.incrementBlockedCount(domain);
      }
      
      return result;
    }
  }

  private isInWhitelist(domain: string, whitelist: string[]): boolean {
    return whitelist.some(item => {
      const pattern = item.replace(/\*/g, '.*');
      return new RegExp(pattern).test(domain);
    });
  }

  private isInBlacklist(domain: string, blacklist: string[]): boolean {
    // Common distraction domains
    const commonDistractions = [
      'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
      'tiktok.com', 'reddit.com', 'netflix.com', 'twitch.tv',
      'steam.com', 'discord.com', 'snapchat.com', 'pinterest.com'
    ];
    
    const allBlocked = [...blacklist, ...commonDistractions];
    
    return allBlocked.some(item => {
      const pattern = item.replace(/\*/g, '.*');
      return new RegExp(pattern).test(domain);
    });
  }

  async batchClassifyURLs(urls: CheckURLPayload[]): Promise<URLClassification[]> {
    // Check cache first
    const results: URLClassification[] = [];
    const uncached: CheckURLPayload[] = [];
    
    for (const url of urls) {
      const cached = await Storage.getURLClassification(url.url);
      if (cached) {
        results.push(cached);
      } else {
        uncached.push(url);
      }
    }
    
    if (uncached.length === 0) {
      return results;
    }
    
    // Classify uncached URLs
    if (this.session) {
      try {
        const aiResults = await aiService.batchClassifyURLs(
          uncached,
          this.session.intent
        );
        
        // Cache results
        for (const result of aiResults) {
          await Storage.setURLClassification(result);
          results.push(result);
        }
      } catch (error) {
        console.error('Batch classification failed:', error);
        // Fallback to individual classification
        for (const url of uncached) {
          const result = await this.classifyURL(url);
          results.push(result);
        }
      }
    }
    
    return results;
  }
}
