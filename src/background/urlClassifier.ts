// URL Classifier - determines if URLs should be blocked

import type { FocusSession, URLClassification, CheckURLPayload } from '../services/types';
import { Storage } from '../services/storage';
import { aiService } from '../services/aiService';
import { extractDomain, calculateSimilarity } from '../utils/helpers';

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

    // 4. Keyword matching (for quick decisions)
    const keywordScore = this.calculateKeywordScore(payload, rules.keywords);
    
    if (rules.strictness === 'relaxed' && keywordScore > 0.3) {
      const result: URLClassification = {
        url: payload.url,
        relevant: true,
        confidence: Math.floor(keywordScore * 100),
        reason: 'Keyword match',
        timestamp: Date.now(),
        source: 'rules',
      };
      await Storage.setURLClassification(result);
      return result;
    }

    if (rules.strictness === 'strict' && keywordScore < 0.5) {
      await Storage.incrementBlockedCount(domain);
      const result: URLClassification = {
        url: payload.url,
        relevant: false,
        confidence: Math.floor((1 - keywordScore) * 100),
        reason: 'Low keyword relevance',
        timestamp: Date.now(),
        source: 'rules',
      };
      await Storage.setURLClassification(result);
      return result;
    }

    // 5. AI classification (fallback)
    try {
      const aiResult = await aiService.classifyURL(
        payload,
        this.session.intent,
        rules.keywords
      );
      
      await Storage.setURLClassification(aiResult);
      
      if (!aiResult.relevant) {
        await Storage.incrementBlockedCount(domain);
      }
      
      return aiResult;
    } catch (error) {
      console.error('AI classification failed:', error);
      
      // Fallback to keyword-based decision
      const fallbackRelevant = keywordScore > 0.4;
      const result: URLClassification = {
        url: payload.url,
        relevant: fallbackRelevant,
        confidence: 50,
        reason: 'AI unavailable, using keyword matching',
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

  private calculateKeywordScore(payload: CheckURLPayload, keywords: string[]): number {
    if (keywords.length === 0) return 0.5;
    
    const text = `${payload.url} ${payload.title || ''}`.toLowerCase();
    
    // Check exact keyword matches
    let matchCount = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }
    
    const exactScore = matchCount / keywords.length;
    
    // Check similarity
    const keywordsText = keywords.join(' ');
    const similarityScore = calculateSimilarity(text, keywordsText);
    
    // Weighted average
    return exactScore * 0.7 + similarityScore * 0.3;
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
          this.session.intent,
          this.session.rules.keywords
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
