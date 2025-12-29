/**
 * AI Search Service
 * 
 * Integrates Fireplexity-style AI search functionality with:
 * - Firecrawl for web search and scraping
 * - Oxylabs AI Studio for intelligent data extraction
 * - LLM providers for answer synthesis
 */

// ============================================================================
// Types
// ============================================================================

export type SearchMode = 'web' | 'news' | 'images' | 'academic' | 'code';

export interface AISearchConfig {
  firecrawlApiKey?: string;
  oxylabsApiKey?: string;
  groqApiKey?: string;
  openaiApiKey?: string;
  preferredLLM?: 'groq' | 'openai' | 'anthropic';
}

export interface SearchSource {
  title: string;
  url: string;
  snippet: string;
  favicon?: string;
  publishedDate?: string;
  relevanceScore?: number;
}

export interface AISearchResult {
  query: string;
  answer: string;
  sources: SearchSource[];
  followUpQuestions: string[];
  metadata: {
    searchMode: SearchMode;
    totalSources: number;
    processingTimeMs: number;
    tokensUsed: number;
    model: string;
  };
}

export interface OxylabsSearchResult {
  title: string;
  url: string;
  description: string;
  content?: string;
}

export interface OxylabsScrapeResult {
  content: string;
  markdown?: string;
  structuredData?: Record<string, unknown>;
  metadata: {
    title?: string;
    description?: string;
    url: string;
  };
}

// ============================================================================
// Oxylabs AI Studio Client
// ============================================================================

export class OxylabsAIStudioClient {
  private apiKey: string;
  private baseUrl = 'https://aistudio.oxylabs.io/api';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * AI-powered web search
   */
  async search(
    query: string,
    options?: {
      limit?: number;
      renderJavascript?: boolean;
      returnContent?: boolean;
      geoLocation?: string;
    }
  ): Promise<OxylabsSearchResult[]> {
    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        query,
        limit: options?.limit ?? 10,
        render_javascript: options?.renderJavascript ?? false,
        return_content: options?.returnContent ?? true,
        geo_location: options?.geoLocation,
      }),
    });

    if (!response.ok) {
      throw new Error(`Oxylabs search error: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * AI-powered instant search (faster, limited to 10 results)
   */
  async instantSearch(
    query: string,
    limit: number = 10
  ): Promise<OxylabsSearchResult[]> {
    const response = await fetch(`${this.baseUrl}/search/instant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        query,
        limit: Math.min(limit, 10),
      }),
    });

    if (!response.ok) {
      throw new Error(`Oxylabs instant search error: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * AI-powered scraping with natural language prompts
   */
  async scrape(
    url: string,
    options?: {
      outputFormat?: 'markdown' | 'json' | 'csv' | 'screenshot';
      schema?: Record<string, string>;
      renderJavascript?: boolean | 'auto';
      geoLocation?: string;
    }
  ): Promise<OxylabsScrapeResult> {
    const response = await fetch(`${this.baseUrl}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        url,
        output_format: options?.outputFormat ?? 'markdown',
        schema: options?.schema,
        render_javascript: options?.renderJavascript ?? false,
        geo_location: options?.geoLocation,
      }),
    });

    if (!response.ok) {
      throw new Error(`Oxylabs scrape error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.data?.content || data.data?.markdown || '',
      markdown: data.data?.markdown,
      structuredData: data.data?.structured_data,
      metadata: {
        title: data.data?.metadata?.title,
        description: data.data?.metadata?.description,
        url,
      },
    };
  }

  /**
   * AI-powered crawling with natural language guidance
   */
  async crawl(
    url: string,
    userPrompt: string,
    options?: {
      outputFormat?: 'markdown' | 'json' | 'csv';
      schema?: Record<string, string>;
      renderJavascript?: boolean;
      returnSourcesLimit?: number;
      geoLocation?: string;
    }
  ): Promise<{ data: OxylabsScrapeResult[]; totalPages: number }> {
    const response = await fetch(`${this.baseUrl}/crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        url,
        user_prompt: userPrompt,
        output_format: options?.outputFormat ?? 'markdown',
        schema: options?.schema,
        render_javascript: options?.renderJavascript ?? false,
        return_sources_limit: options?.returnSourcesLimit ?? 25,
        geo_location: options?.geoLocation,
      }),
    });

    if (!response.ok) {
      throw new Error(`Oxylabs crawl error: ${response.status}`);
    }

    const data = await response.json();
    return {
      data: data.data || [],
      totalPages: data.total_pages || 0,
    };
  }

  /**
   * AI Browser Agent for complex interactions
   */
  async browserAgent(
    url: string,
    userPrompt: string,
    options?: {
      outputFormat?: 'markdown' | 'json' | 'html' | 'screenshot';
      schema?: Record<string, string>;
      geoLocation?: string;
    }
  ): Promise<{ data: unknown; actions: string[] }> {
    const response = await fetch(`${this.baseUrl}/browser-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        url,
        user_prompt: userPrompt,
        output_format: options?.outputFormat ?? 'markdown',
        schema: options?.schema,
        geo_location: options?.geoLocation,
      }),
    });

    if (!response.ok) {
      throw new Error(`Oxylabs browser agent error: ${response.status}`);
    }

    const data = await response.json();
    return {
      data: data.data,
      actions: data.actions || [],
    };
  }

  /**
   * Generate JSON schema from natural language
   */
  async generateSchema(prompt: string): Promise<Record<string, string>> {
    const response = await fetch(`${this.baseUrl}/schema/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Schema generation error: ${response.status}`);
    }

    const data = await response.json();
    return data.schema || {};
  }

  /**
   * Map a domain to discover URLs
   */
  async mapDomain(
    url: string,
    options?: {
      searchKeywords?: string[];
      userPrompt?: string;
      maxCrawlDepth?: number;
      limit?: number;
      includeSitemap?: boolean;
    }
  ): Promise<{ urls: string[]; total: number }> {
    const response = await fetch(`${this.baseUrl}/map`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        url,
        search_keywords: options?.searchKeywords,
        user_prompt: options?.userPrompt,
        max_crawl_depth: options?.maxCrawlDepth ?? 1,
        limit: options?.limit ?? 25,
        include_sitemap: options?.includeSitemap ?? true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Map domain error: ${response.status}`);
    }

    const data = await response.json();
    return {
      urls: data.data || [],
      total: data.total || 0,
    };
  }
}

// ============================================================================
// Firecrawl Client
// ============================================================================

export class FirecrawlClient {
  private apiKey: string;
  private baseUrl = 'https://api.firecrawl.dev/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Search the web and scrape results
   */
  async search(
    query: string,
    options?: {
      limit?: number;
      scrapeOptions?: {
        formats?: ('markdown' | 'html')[];
        onlyMainContent?: boolean;
      };
    }
  ): Promise<SearchSource[]> {
    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        query,
        limit: options?.limit ?? 5,
        scrapeOptions: {
          formats: options?.scrapeOptions?.formats ?? ['markdown'],
          onlyMainContent: options?.scrapeOptions?.onlyMainContent ?? true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Firecrawl search error: ${response.status}`);
    }

    const data = await response.json();
    
    return (data.data || []).map((item: {
      title?: string;
      url?: string;
      markdown?: string;
      metadata?: { description?: string };
    }) => ({
      title: item.title || 'Untitled',
      url: item.url || '',
      snippet: item.markdown?.substring(0, 300) || item.metadata?.description || '',
    }));
  }

  /**
   * Scrape a single URL
   */
  async scrape(
    url: string,
    options?: {
      formats?: ('markdown' | 'html')[];
      onlyMainContent?: boolean;
    }
  ): Promise<{
    content: string;
    markdown?: string;
    html?: string;
    metadata: {
      title?: string;
      description?: string;
    };
  }> {
    const response = await fetch(`${this.baseUrl}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: options?.formats ?? ['markdown'],
        onlyMainContent: options?.onlyMainContent ?? true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Firecrawl scrape error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.data?.markdown || data.data?.html || '',
      markdown: data.data?.markdown,
      html: data.data?.html,
      metadata: {
        title: data.data?.metadata?.title,
        description: data.data?.metadata?.description,
      },
    };
  }

  /**
   * Map a website to discover URLs
   */
  async map(url: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/map`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`Firecrawl map error: ${response.status}`);
    }

    const data = await response.json();
    return data.links || [];
  }
}

// ============================================================================
// AI Search Engine (Fireplexity-style)
// ============================================================================

export class AISearchEngine {
  private config: AISearchConfig;
  private firecrawl?: FirecrawlClient;
  private oxylabs?: OxylabsAIStudioClient;

  constructor(config: AISearchConfig) {
    this.config = config;
    
    if (config.firecrawlApiKey) {
      this.firecrawl = new FirecrawlClient(config.firecrawlApiKey);
    }
    if (config.oxylabsApiKey) {
      this.oxylabs = new OxylabsAIStudioClient(config.oxylabsApiKey);
    }
  }

  /**
   * Perform AI-powered search with answer synthesis
   */
  async search(
    query: string,
    options?: {
      mode?: SearchMode;
      maxSources?: number;
      synthesizeAnswer?: boolean;
    }
  ): Promise<AISearchResult> {
    const startTime = Date.now();
    const mode = options?.mode ?? 'web';
    const maxSources = options?.maxSources ?? 5;

    // Step 1: Search for sources
    let sources: SearchSource[] = [];
    
    if (this.firecrawl) {
      try {
        sources = await this.firecrawl.search(query, { limit: maxSources });
      } catch (error) {
        console.warn('Firecrawl search failed, trying Oxylabs:', error);
      }
    }

    if (sources.length === 0 && this.oxylabs) {
      try {
        const oxylabsResults = await this.oxylabs.instantSearch(query, maxSources);
        sources = oxylabsResults.map(r => ({
          title: r.title,
          url: r.url,
          snippet: r.description || r.content?.substring(0, 300) || '',
        }));
      } catch (error) {
        console.warn('Oxylabs search failed:', error);
      }
    }

    // If no API is available, use demo data
    if (sources.length === 0) {
      sources = this.generateDemoSources(query);
    }

    // Step 2: Synthesize answer
    let answer = '';
    let tokensUsed = 0;
    let model = 'demo';

    if (options?.synthesizeAnswer !== false) {
      const synthesis = await this.synthesizeAnswer(query, sources);
      answer = synthesis.answer;
      tokensUsed = synthesis.tokensUsed;
      model = synthesis.model;
    }

    // Step 3: Generate follow-up questions
    const followUpQuestions = this.generateFollowUpQuestions(query, sources);

    return {
      query,
      answer,
      sources,
      followUpQuestions,
      metadata: {
        searchMode: mode,
        totalSources: sources.length,
        processingTimeMs: Date.now() - startTime,
        tokensUsed,
        model,
      },
    };
  }

  /**
   * Synthesize an answer from sources using LLM
   */
  private async synthesizeAnswer(
    query: string,
    sources: SearchSource[]
  ): Promise<{ answer: string; tokensUsed: number; model: string }> {
    const context = sources
      .map((s, i) => `[${i + 1}] ${s.title}\n${s.snippet}`)
      .join('\n\n');

    const systemPrompt = `You are a helpful AI assistant that answers questions based on search results. 
Provide a comprehensive, well-structured answer based on the sources provided.
Always cite your sources using [1], [2], etc. format.
If the sources don't contain relevant information, say so honestly.`;

    const userPrompt = `Question: ${query}

Sources:
${context}

Please provide a comprehensive answer based on these sources.`;

    // Try Groq first (fast)
    if (this.config.groqApiKey) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.groqApiKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.1-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 1024,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return {
            answer: data.choices?.[0]?.message?.content || '',
            tokensUsed: data.usage?.total_tokens || 0,
            model: 'groq/llama-3.1-70b',
          };
        }
      } catch (error) {
        console.warn('Groq synthesis failed:', error);
      }
    }

    // Try OpenAI
    if (this.config.openaiApiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 1024,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return {
            answer: data.choices?.[0]?.message?.content || '',
            tokensUsed: data.usage?.total_tokens || 0,
            model: 'openai/gpt-4o-mini',
          };
        }
      } catch (error) {
        console.warn('OpenAI synthesis failed:', error);
      }
    }

    // Fallback to demo answer
    return {
      answer: this.generateDemoAnswer(query, sources),
      tokensUsed: 0,
      model: 'demo',
    };
  }

  /**
   * Generate demo sources for testing
   */
  private generateDemoSources(query: string): SearchSource[] {
    return [
      {
        title: `Understanding ${query}`,
        url: 'https://example.com/article-1',
        snippet: `This comprehensive guide covers everything you need to know about ${query}. We explore the key concepts, best practices, and common use cases.`,
        relevanceScore: 0.95,
      },
      {
        title: `${query} - Complete Guide 2024`,
        url: 'https://example.com/guide',
        snippet: `An in-depth exploration of ${query} with practical examples and real-world applications. Updated for 2024 with the latest developments.`,
        relevanceScore: 0.90,
      },
      {
        title: `How to Get Started with ${query}`,
        url: 'https://example.com/getting-started',
        snippet: `A beginner-friendly introduction to ${query}. Learn the fundamentals and start building your first project today.`,
        relevanceScore: 0.85,
      },
    ];
  }

  /**
   * Generate demo answer
   */
  private generateDemoAnswer(query: string, sources: SearchSource[]): string {
    return `Based on the search results, here's what I found about "${query}":

**Overview**
${sources[0]?.snippet || 'Information about this topic is available from multiple sources.'}

**Key Points**
1. ${sources[0]?.title || 'Various aspects'} - provides comprehensive coverage [1]
2. ${sources[1]?.title || 'Additional resources'} - offers practical guidance [2]
3. ${sources[2]?.title || 'Getting started guides'} - helps beginners understand the basics [3]

**Summary**
The search results indicate that ${query} is a topic with multiple facets. For more detailed information, please refer to the sources listed above.

*Note: This is a demo response. Configure API keys for real AI-powered answers.*`;
  }

  /**
   * Generate follow-up questions
   */
  private generateFollowUpQuestions(query: string, sources: SearchSource[]): string[] {
    const baseQuestions = [
      `What are the best practices for ${query}?`,
      `How does ${query} compare to alternatives?`,
      `What are common mistakes to avoid with ${query}?`,
      `What's new in ${query} for 2024?`,
    ];

    return baseQuestions.slice(0, 3);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AISearchConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.firecrawlApiKey) {
      this.firecrawl = new FirecrawlClient(config.firecrawlApiKey);
    }
    if (config.oxylabsApiKey) {
      this.oxylabs = new OxylabsAIStudioClient(config.oxylabsApiKey);
    }
  }
}

// ============================================================================
// Factory
// ============================================================================

export function createAISearchEngine(config: AISearchConfig = {}): AISearchEngine {
  return new AISearchEngine(config);
}

export function createOxylabsClient(apiKey: string): OxylabsAIStudioClient {
  return new OxylabsAIStudioClient(apiKey);
}

export function createFirecrawlClient(apiKey: string): FirecrawlClient {
  return new FirecrawlClient(apiKey);
}
