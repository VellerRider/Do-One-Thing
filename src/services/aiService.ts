// AI Service for intent analysis and URL classification

import type { 
  AIConfig, 
  IntentAnalysisResult, 
  URLClassification,
  CheckURLPayload 
} from './types';
import { Storage } from './storage';

export class AIService {
  private config: AIConfig | null = null;

  async initialize() {
    this.config = await Storage.getAIConfig();
  }

  async analyzeIntent(userInput: string): Promise<IntentAnalysisResult> {
    if (!this.config || !this.config.enabled) {
      throw new Error('AI service not configured');
    }

    if (this.config.provider === 'openai') {
      return this.analyzeIntentWithOpenAI(userInput);
    }

    throw new Error(`Unsupported AI provider: ${this.config.provider}`);
  }

  private async analyzeIntentWithOpenAI(userInput: string): Promise<IntentAnalysisResult> {
    const prompt = `You are a focus assistant. The user wants to focus on one thing. Analyze their intent:

User said: "${userInput}"

Return a JSON object with:
{
  "intent": "concise description of what user wants to focus on",
  "keywords": ["keyword1", "keyword2", ...] (at least 10 relevant keywords),
  "allowedCategories": ["category1", ...] (website categories that are relevant),
  "blockedCategories": ["category1", ...] (website categories that should be blocked),
  "suggestedWebsites": ["website1.com", "website2.com", ...] (5-10 relevant websites),
  "confidence": 95 (0-100, how confident you are about understanding the intent)
}

Be comprehensive with keywords. Include synonyms, related terms, and domain-specific terms.
`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config!.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config!.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that analyzes user focus intentions. Always respond with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      
      return {
        intent: result.intent,
        keywords: result.keywords || [],
        allowedCategories: result.allowedCategories || [],
        blockedCategories: result.blockedCategories || [],
        suggestedWebsites: result.suggestedWebsites || [],
        confidence: result.confidence || 80,
      };
    } catch (error) {
      console.error('Error analyzing intent:', error);
      throw error;
    }
  }

  async classifyURL(payload: CheckURLPayload, intent: string, keywords: string[]): Promise<URLClassification> {
    if (!this.config || !this.config.enabled) {
      throw new Error('AI service not configured');
    }

    if (this.config.provider === 'openai') {
      return this.classifyURLWithOpenAI(payload, intent, keywords);
    }

    throw new Error(`Unsupported AI provider: ${this.config.provider}`);
  }

  private async classifyURLWithOpenAI(
    payload: CheckURLPayload, 
    intent: string, 
    keywords: string[]
  ): Promise<URLClassification> {
    const prompt = `Focus Goal: ${intent}
Keywords: ${keywords.join(', ')}

Website URL: ${payload.url}
${payload.title ? `Page Title: ${payload.title}` : ''}

Is this website relevant to the focus goal? Consider:
1. Does it help achieve the stated goal?
2. Is it educational/productive for this goal?
3. Or is it a distraction (entertainment, social media, shopping, etc.)?

Return JSON:
{
  "relevant": true/false,
  "confidence": 0-100,
  "reason": "brief explanation"
}

Be strict. When in doubt, mark as not relevant.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config!.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config!.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a focus assistant that determines if websites are relevant to a user\'s goal. Be strict and conservative. Always respond with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      
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

  async batchClassifyURLs(urls: CheckURLPayload[], intent: string, keywords: string[]): Promise<URLClassification[]> {
    // For better performance, batch multiple URLs in one API call
    const urlList = urls.map(u => `- ${u.url}${u.title ? ` (${u.title})` : ''}`).join('\n');
    
    const prompt = `Focus Goal: ${intent}
Keywords: ${keywords.join(', ')}

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
          model: this.config!.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a focus assistant. Classify websites based on relevance. Always respond with valid JSON array.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const results = JSON.parse(data.choices[0].message.content);
      
      return results.classifications.map((r: any) => ({
        url: r.url,
        relevant: r.relevant,
        confidence: r.confidence || 80,
        reason: r.reason,
        timestamp: Date.now(),
        source: 'ai',
      }));
    } catch (error) {
      console.error('Error batch classifying URLs:', error);
      // Fallback to individual classification
      const results = await Promise.all(
        urls.map(url => this.classifyURL(url, intent, keywords))
      );
      return results;
    }
  }
}

// Singleton instance
export const aiService = new AIService();
