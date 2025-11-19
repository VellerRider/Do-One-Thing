// AI Service for intent analysis and URL classification

import type { 
  AIConfig, 
  IntentAnalysisResult, 
  URLClassification,
  CheckURLPayload,
  UserSettings,
} from './types';
import { Storage } from './storage';

export class AIService {
  private config: AIConfig | null = null;
  private settings: UserSettings | null = null;

  async initialize() {
    const [aiConfig, userSettings] = await Promise.all([
      Storage.getAIConfig(),
      Storage.getSettings(),
    ]);

    this.config = aiConfig;
    this.settings = userSettings;
    console.log('AI Service initialized with config:', this.config ? {
      provider: this.config.provider,
      model: this.config.model,
      enabled: this.config.enabled,
      hasApiKey: !!this.config.apiKey
    } : 'No config');
    console.log('AI settings:', this.settings ? {
      aiEnabled: this.settings.aiEnabled,
      dataSharingConsent: this.settings.dataSharingConsent,
    } : 'No settings');
  }

  async analyzeIntent(userInput: string): Promise<IntentAnalysisResult> {
    console.log('analyzeIntent called with:', userInput);
    
    const config = this.ensureAIUsageAllowed();

    if (config.provider === 'openai') {
      return this.analyzeIntentWithOpenAI(userInput);
    }

    throw new Error(`Unsupported AI provider: ${config.provider}`);
  }

  private async analyzeIntentWithOpenAI(userInput: string): Promise<IntentAnalysisResult> {
    const prompt = `You are a focus coach. Rewrite the user's goal so it is short, clear, and action-focused.

User goal: "${userInput}"

Return JSON:
{
  "intent": "concise restatement of the goal in 10 words or fewer",
  "confidence": 95
}`;

    try {
      console.log('Calling OpenAI API with model:', this.config!.model);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config!.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config!.model || 'gpt-5-mini',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that analyzes user focus intentions. Always respond with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        }),
      });

      console.log('OpenAI response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI API error:', response.status, errorData);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
      }

      const data = await response.json();
      console.log('OpenAI response received successfully');
      
      const result = JSON.parse(data.choices[0].message.content);
      
      return {
        intent: result.intent || userInput,
        confidence: result.confidence || 80,
      };
    } catch (error) {
      console.error('Error analyzing intent:', error);
      throw error;
    }
  }

  async classifyURL(
    payload: CheckURLPayload, 
    intent: string,
    strictness: 'relaxed' | 'standard' | 'strict' = 'standard'
  ): Promise<URLClassification> {
    const config = this.ensureAIUsageAllowed();

    if (config.provider === 'openai') {
      return this.classifyURLWithOpenAI(payload, intent, strictness);
    }

    throw new Error(`Unsupported AI provider: ${config.provider}`);
  }

  private async classifyURLWithOpenAI(
    payload: CheckURLPayload, 
    intent: string,
    strictness: 'relaxed' | 'standard' | 'strict'
  ): Promise<URLClassification> {
    // Extract domain and URL parameters to analyze content
    const url = new URL(payload.url);
    const domain = url.hostname.replace('www.', '');
    const searchParams = url.searchParams.toString();
    const urlPath = url.pathname;
    
    // Identify general knowledge websites
    const generalKnowledgeSites = [
      'google.com', 'google.co', 'bing.com', 'duckduckgo.com', 'baidu.com',
      'wikipedia.org', 'wikihow.com', 'zhihu.com',
      'stackoverflow.com', 'stackexchange.com', 
      'github.com', 'gitlab.com',
      'youtube.com', 'medium.com', 'reddit.com', 'quora.com'
    ];
    
    const isGeneralSite = generalKnowledgeSites.some(site => domain.includes(site));
    
    // Build strictness-aware instructions
    let strictnessInstruction = '';
    if (strictness === 'relaxed') {
      strictnessInstruction = `Be LENIENT and permissive. Allow websites unless they are clearly distracting (entertainment, social media, shopping unrelated to the goal).
For general knowledge sites (Google, Wikipedia, etc.), focus on the SEARCH TERMS, URL PARAMETERS, and PAGE TITLE:
- If the search terms or page content relate to the focus goal, or potentially contribute to it, ALLOW it
- Only block if the content is clearly off-topic or distracting`;
    } else if (strictness === 'standard') {
      strictnessInstruction = `Be BALANCED. Allow websites that are reasonably related to the goal.
For general knowledge sites (Google, Wikipedia, etc.), analyze the SPECIFIC CONTENT:
- Check URL parameters (search queries, article topics)
- Check page title
- Allow if the content could reasonably help with the focus goal`;
    } else {
      strictnessInstruction = `Be STRICT. Only allow websites that directly help achieve the goal.
Even for general sites, check if the specific content (search terms, page topic) is directly relevant.`;
    }
    
    const prompt = `Focus Goal: ${intent}
Strictness Mode: ${strictness}
General Rule: Allow pages whenever they could plausibly support the focus goal. Only block when the content is clearly irrelevant or distracting.

Website Analysis:
- Domain: ${domain}
- Full URL: ${payload.url}
- URL Path: ${urlPath}
- URL Parameters: ${searchParams || 'none'}
${payload.title ? `- Page Title: ${payload.title}` : ''}
${isGeneralSite ? `- Note: This is a GENERAL KNOWLEDGE site (like Google/Wikipedia). Judge by the SPECIFIC CONTENT (search terms, article topic, URL parameters), NOT the domain itself.` : ''}

${strictnessInstruction}

Return JSON:
{
  "relevant": true/false,
  "confidence": 0-100,
  "reason": "brief explanation focusing on the specific content/search terms"
}`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config!.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config!.model || 'gpt-5-mini',
          messages: [
            { role: 'system', content: 'You are a focus assistant that determines if websites are relevant to a user\'s goal. For general knowledge sites (Google, Wikipedia, etc.), always analyze the SPECIFIC CONTENT (search queries, article topics, URL parameters) rather than blocking the entire domain. Always respond with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);

      console.log('[AI] URL classification result:', {
        url: payload.url,
        relevant: result.relevant,
        confidence: result.confidence,
        reason: result.reason,
      });
      
      return {
        url: payload.url,
        relevant: result.relevant,
        confidence: result.confidence || 80,
        reason: result.reason,
        timestamp: Date.now(),
        source: 'ai',
      };
    } catch (error) {
      console.error('Error classifying URL:', error);
      throw error;
    }
  }

  async batchClassifyURLs(urls: CheckURLPayload[], intent: string): Promise<URLClassification[]> {
    this.ensureAIUsageAllowed();
    // For better performance, batch multiple URLs in one API call
    const urlList = urls.map(u => `- ${u.url}${u.title ? ` (${u.title})` : ''}`).join('\n');
    
    const prompt = `Focus Goal: ${intent}
General Rule: Allow pages whenever they could plausibly support the focus goal. Only block when the content is clearly irrelevant or distracting.

Classify these websites as relevant or not:
${urlList}

Return JSON array:
[
  {"url": "...", "relevant": true/false, "confidence": 0-100, "reason": "..."},
  ...
]`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config!.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config!.model || 'gpt-5-mini',
          messages: [
            { role: 'system', content: 'You are a focus assistant. Classify websites based on relevance. Always respond with valid JSON array.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const results = JSON.parse(data.choices[0].message.content);
      
      const mapped: URLClassification[] = results.classifications.map((r: any) => ({
        url: r.url,
        relevant: r.relevant,
        confidence: r.confidence || 80,
        reason: r.reason,
        timestamp: Date.now(),
        source: 'ai',
      }));

      mapped.forEach((result) => {
        console.log('[AI] Batch URL classification:', {
          url: result.url,
          relevant: result.relevant,
          confidence: result.confidence,
          reason: result.reason,
        });
      });

      return mapped;
    } catch (error) {
      console.error('Error batch classifying URLs:', error);
      // Fallback to individual classification
      const results = await Promise.all(
        urls.map(url => this.classifyURL(url, intent))
      );
      return results;
    }
  }

  private ensureAIUsageAllowed(): AIConfig {
    if (!this.settings?.aiEnabled) {
      throw new Error('AI filtering is disabled in settings.');
    }

    if (!this.settings?.dataSharingConsent) {
      throw new Error('Please consent to data sharing before using AI features.');
    }

    if (!this.config || !this.config.enabled) {
      throw new Error('AI service not configured. Please set your API key in settings.');
    }

    if (!this.config.apiKey) {
      throw new Error('API key is missing. Please set your API key in settings.');
    }

    return this.config;
  }
}

// Singleton instance
export const aiService = new AIService();
