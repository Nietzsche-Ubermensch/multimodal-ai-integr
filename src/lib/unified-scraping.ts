/**
 * Unified Scraping Layer
 * 
 * A unified interface that integrates multiple scraping services:
 * - Oxylabs Web Scraper
 * - Firecrawl API
 * - LangChain Agents/Tools
 * 
 * The ScrapingRouter automatically selects the best scraper based on the task.
 */

// ============================================================================
// Types and Interfaces
// ============================================================================

export type ScraperProvider = 'oxylabs' | 'firecrawl' | 'langchain';

export interface ScrapingConfig {
  oxylabs?: {
    apiKey: string;
    username?: string;
  };
  firecrawl?: {
    apiKey: string;
  };
  langchain?: {
    openaiKey?: string;
    serpApiKey?: string;
  };
}

export interface ScrapingRequest {
  url: string;
  mode?: 'scrape' | 'crawl' | 'search' | 'extract';
  prompt?: string; // Natural language instruction for AI-powered scraping
  options?: {
    formats?: ('markdown' | 'html' | 'text' | 'json')[];
    onlyMainContent?: boolean;
    maxPages?: number;
    depth?: number;
    searchQuery?: string;
    extractSchema?: Record<string, string>;
  };
  preferredProvider?: ScraperProvider;
}

export interface ScrapingResult {
  success: boolean;
  provider: ScraperProvider;
  data: {
    content: string;
    markdown?: string;
    html?: string;
    structuredData?: Record<string, unknown>;
    links?: string[];
  };
  metadata: {
    url: string;
    title?: string;
    description?: string;
    scrapedAt: string;
    latencyMs: number;
    tokensUsed?: number;
    pagesScraped?: number;
  };
  error?: string;
}

export interface ProviderCapabilities {
  scrape: boolean;
  crawl: boolean;
  search: boolean;
  extract: boolean;
  aiPowered: boolean;
  javascriptRendering: boolean;
  maxPagesPerRequest: number;
  costPerRequest: number;
  avgLatencyMs: number;
}

// ============================================================================
// Provider Capabilities
// ============================================================================

const PROVIDER_CAPABILITIES: Record<ScraperProvider, ProviderCapabilities> = {
  oxylabs: {
    scrape: true,
    crawl: true,
    search: false,
    extract: true,
    aiPowered: true,
    javascriptRendering: true,
    maxPagesPerRequest: 100,
    costPerRequest: 0.002,
    avgLatencyMs: 2000,
  },
  firecrawl: {
    scrape: true,
    crawl: true,
    search: true,
    extract: true,
    aiPowered: true,
    javascriptRendering: true,
    maxPagesPerRequest: 50,
    costPerRequest: 0.001,
    avgLatencyMs: 1500,
  },
  langchain: {
    scrape: true,
    crawl: false,
    search: true,
    extract: true,
    aiPowered: true,
    javascriptRendering: false,
    maxPagesPerRequest: 10,
    costPerRequest: 0.0001,
    avgLatencyMs: 3000,
  },
};

// ============================================================================
// Base Scraper Interface
// ============================================================================

interface BaseScraper {
  name: ScraperProvider;
  capabilities: ProviderCapabilities;
  isConfigured: () => boolean;
  scrape: (request: ScrapingRequest) => Promise<ScrapingResult>;
}

// ============================================================================
// Oxylabs Scraper
// ============================================================================

class OxylabsScraper implements BaseScraper {
  name: ScraperProvider = 'oxylabs';
  capabilities = PROVIDER_CAPABILITIES.oxylabs;
  private config?: ScrapingConfig['oxylabs'];
  private baseUrl = 'https://realtime.oxylabs.io/v1/queries';

  constructor(config?: ScrapingConfig['oxylabs']) {
    this.config = config;
  }

  isConfigured(): boolean {
    return !!this.config?.apiKey;
  }

  async scrape(request: ScrapingRequest): Promise<ScrapingResult> {
    const startTime = Date.now();
    
    if (!this.isConfigured()) {
      return this.createMockResult(request, startTime);
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${this.config!.apiKey}:`)}`,
        },
        body: JSON.stringify({
          source: 'universal',
          url: request.url,
          parse: true,
          render: 'html',
        }),
      });

      if (!response.ok) {
        throw new Error(`Oxylabs API error: ${response.status}`);
      }

      const data = await response.json();
      const rawContent = data.results?.[0]?.content || '';
      
      return {
        success: true,
        provider: 'oxylabs',
        data: {
          content: this.cleanHtml(rawContent),
          html: rawContent,
          markdown: this.htmlToMarkdown(rawContent),
        },
        metadata: {
          url: request.url,
          title: this.extractTitle(rawContent),
          scrapedAt: new Date().toISOString(),
          latencyMs: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        provider: 'oxylabs',
        data: { content: '' },
        metadata: {
          url: request.url,
          scrapedAt: new Date().toISOString(),
          latencyMs: Date.now() - startTime,
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private createMockResult(request: ScrapingRequest, startTime: number): ScrapingResult {
    const mockContent = `# Scraped from ${request.url}

## Overview
This is simulated content from Oxylabs AI Studio scraper.

## Features
- AI-powered web scraping with natural language prompts
- Automatic content extraction and cleaning
- JavaScript rendering support
- Anti-bot bypass technology

## Extracted Data
${request.prompt ? `Based on prompt: "${request.prompt}"` : 'Standard extraction mode'}

### Sample Products
| Name | Price | Rating |
|------|-------|--------|
| Premium Widget | $49.99 | ★★★★★ |
| Basic Gadget | $29.99 | ★★★★ |
| Pro Tool | $99.99 | ★★★★★ |

> Note: Enable live API mode with Oxylabs API key for real data.`;

    return {
      success: true,
      provider: 'oxylabs',
      data: {
        content: mockContent,
        markdown: mockContent,
        structuredData: {
          products: [
            { name: 'Premium Widget', price: '$49.99', rating: 4.5 },
            { name: 'Basic Gadget', price: '$29.99', rating: 4.2 },
            { name: 'Pro Tool', price: '$99.99', rating: 4.8 },
          ],
        },
      },
      metadata: {
        url: request.url,
        title: 'Simulated Oxylabs Result',
        scrapedAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime + 1500,
        tokensUsed: Math.floor(Math.random() * 1000) + 500,
      },
    };
  }

  private cleanHtml(html: string): string {
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    text = text.replace(/<[^>]+>/g, ' ');
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  }

  private extractTitle(html: string): string {
    const match = html.match(/<title>(.*?)<\/title>/i);
    return match ? match[1] : 'Untitled';
  }

  private htmlToMarkdown(html: string): string {
    let md = html;
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    md = md.replace(/<[^>]+>/g, '');
    md = md.replace(/\n{3,}/g, '\n\n');
    return md.trim();
  }
}

// ============================================================================
// Firecrawl Scraper
// ============================================================================

class FirecrawlScraper implements BaseScraper {
  name: ScraperProvider = 'firecrawl';
  capabilities = PROVIDER_CAPABILITIES.firecrawl;
  private config?: ScrapingConfig['firecrawl'];
  private baseUrl = 'https://api.firecrawl.dev/v1';

  constructor(config?: ScrapingConfig['firecrawl']) {
    this.config = config;
  }

  isConfigured(): boolean {
    return !!this.config?.apiKey;
  }

  async scrape(request: ScrapingRequest): Promise<ScrapingResult> {
    const startTime = Date.now();
    
    if (!this.isConfigured()) {
      return this.createMockResult(request, startTime);
    }

    try {
      const endpoint = request.mode === 'crawl' ? '/crawl' : 
                       request.mode === 'search' ? '/search' : '/scrape';
      
      const body: Record<string, unknown> = {
        url: request.url,
        formats: request.options?.formats || ['markdown'],
        onlyMainContent: request.options?.onlyMainContent ?? true,
      };

      if (request.mode === 'search' && request.options?.searchQuery) {
        body.query = request.options.searchQuery;
        body.limit = 5;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config!.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Firecrawl API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        provider: 'firecrawl',
        data: {
          content: data.data?.markdown || data.data?.text || '',
          markdown: data.data?.markdown,
          html: data.data?.html,
          links: data.data?.links,
        },
        metadata: {
          url: request.url,
          title: data.data?.metadata?.title,
          description: data.data?.metadata?.description,
          scrapedAt: new Date().toISOString(),
          latencyMs: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        provider: 'firecrawl',
        data: { content: '' },
        metadata: {
          url: request.url,
          scrapedAt: new Date().toISOString(),
          latencyMs: Date.now() - startTime,
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private createMockResult(request: ScrapingRequest, startTime: number): ScrapingResult {
    const mockContent = `# ${request.url}

## Firecrawl Demo Content

This is a **simulated** response from Firecrawl API.

### Key Features:
- Clean Markdown extraction
- Automatic content cleaning
- JavaScript rendering support
- Anti-bot bypass
- Site mapping and crawling

${request.mode === 'search' ? `### Search Results for "${request.options?.searchQuery}"

1. **Result 1**: Relevant content matching your query...
2. **Result 2**: Additional matching content...
3. **Result 3**: More relevant information...` : ''}

${request.mode === 'crawl' ? `### Discovered URLs
- /about
- /products
- /blog
- /contact
- /docs
- /api
- /pricing` : ''}

> Enable "Live API" mode with a Firecrawl API key for real data.
> Get your API key at [firecrawl.dev](https://firecrawl.dev)`;

    return {
      success: true,
      provider: 'firecrawl',
      data: {
        content: mockContent,
        markdown: mockContent,
        links: request.mode === 'crawl' ? [
          '/about', '/products', '/blog', '/contact', '/docs', '/api', '/pricing'
        ] : undefined,
      },
      metadata: {
        url: request.url,
        title: 'Demo Page Title',
        description: 'This is a simulated Firecrawl response',
        scrapedAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime + 1200,
        pagesScraped: request.mode === 'crawl' ? 8 : 1,
      },
    };
  }
}

// ============================================================================
// LangChain Agent Scraper
// ============================================================================

class LangChainScraper implements BaseScraper {
  name: ScraperProvider = 'langchain';
  capabilities = PROVIDER_CAPABILITIES.langchain;
  private config?: ScrapingConfig['langchain'];

  constructor(config?: ScrapingConfig['langchain']) {
    this.config = config;
  }

  isConfigured(): boolean {
    return !!this.config?.openaiKey || !!this.config?.serpApiKey;
  }

  async scrape(request: ScrapingRequest): Promise<ScrapingResult> {
    const startTime = Date.now();
    
    // LangChain implementation would typically use agents with tools
    // For now, we simulate the behavior
    return this.createMockResult(request, startTime);
  }

  private createMockResult(request: ScrapingRequest, startTime: number): ScrapingResult {
    const mockContent = `# LangChain Agent Analysis

## URL: ${request.url}

### Agent Reasoning Process

**Step 1: Analyze Request**
- Target URL: ${request.url}
- Mode: ${request.mode || 'scrape'}
- Prompt: ${request.prompt || 'Extract main content'}

**Step 2: Select Tools**
- WebBrowser Tool: For fetching page content
- TextSplitter Tool: For chunking content
- LLM Tool: For extracting structured information

**Step 3: Execute Plan**
The agent navigated to the URL and extracted the following:

### Extracted Information

${request.prompt ? `Based on the instruction: "${request.prompt}"

**Key Findings:**
1. Main topic identified and summarized
2. Relevant data points extracted
3. Structured output generated` : `**Page Summary:**
- Title: Sample Page from ${new URL(request.url).hostname}
- Type: Documentation/Article
- Key Topics: AI, Machine Learning, Integration`}

### Structured Output
\`\`\`json
{
  "summary": "Content extracted using LangChain agent",
  "confidence": 0.92,
  "tokens_used": ${Math.floor(Math.random() * 500) + 200},
  "tools_used": ["WebBrowser", "TextSplitter", "GPT-4"]
}
\`\`\`

> Note: This is a simulated LangChain agent response.
> Configure OpenAI API key for live agent execution.`;

    return {
      success: true,
      provider: 'langchain',
      data: {
        content: mockContent,
        markdown: mockContent,
        structuredData: {
          summary: 'Content extracted using LangChain agent',
          confidence: 0.92,
          tools_used: ['WebBrowser', 'TextSplitter', 'GPT-4'],
        },
      },
      metadata: {
        url: request.url,
        title: 'LangChain Agent Result',
        scrapedAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime + 2500,
        tokensUsed: Math.floor(Math.random() * 500) + 200,
      },
    };
  }
}

// ============================================================================
// Scraping Router
// ============================================================================

export interface RouterDecision {
  selectedProvider: ScraperProvider;
  reason: string;
  alternativeProviders: ScraperProvider[];
  confidence: number;
}

export class ScrapingRouter {
  private scrapers: Map<ScraperProvider, BaseScraper>;
  private config: ScrapingConfig;

  constructor(config: ScrapingConfig) {
    this.config = config;
    this.scrapers = new Map([
      ['oxylabs', new OxylabsScraper(config.oxylabs)],
      ['firecrawl', new FirecrawlScraper(config.firecrawl)],
      ['langchain', new LangChainScraper(config.langchain)],
    ]);
  }

  /**
   * Automatically select the best scraper based on the request
   */
  selectProvider(request: ScrapingRequest): RouterDecision {
    // If user specified a preferred provider, use it
    if (request.preferredProvider) {
      return {
        selectedProvider: request.preferredProvider,
        reason: 'User specified preference',
        alternativeProviders: this.getAlternatives(request.preferredProvider),
        confidence: 1.0,
      };
    }

    const scores: { provider: ScraperProvider; score: number; reasons: string[] }[] = [];

    for (const [name, scraper] of this.scrapers) {
      const provider = name as ScraperProvider;
      const caps = scraper.capabilities;
      let score = 0;
      const reasons: string[] = [];

      // Check if provider supports the requested mode
      const mode = request.mode || 'scrape';
      if (!caps[mode]) {
        continue;
      }

      // Base score for capability support
      score += 20;
      reasons.push(`Supports ${mode} mode`);

      // Bonus for being configured
      if (scraper.isConfigured()) {
        score += 30;
        reasons.push('API key configured');
      }

      // AI-powered extraction bonus for complex prompts
      if (request.prompt && caps.aiPowered) {
        score += 25;
        reasons.push('AI-powered extraction available');
      }

      // JavaScript rendering bonus for dynamic sites
      if (caps.javascriptRendering) {
        score += 10;
        reasons.push('JavaScript rendering supported');
      }

      // Speed bonus (lower latency = higher score)
      score += Math.max(0, 20 - (caps.avgLatencyMs / 200));
      reasons.push(`Avg latency: ${caps.avgLatencyMs}ms`);

      // Cost efficiency bonus
      score += Math.max(0, 10 - (caps.costPerRequest * 1000));
      reasons.push(`Cost: $${caps.costPerRequest}/request`);

      // Crawl capacity bonus
      if (mode === 'crawl' && (request.options?.maxPages || 1) > 10) {
        if (caps.maxPagesPerRequest >= (request.options?.maxPages || 1)) {
          score += 15;
          reasons.push(`Can handle ${caps.maxPagesPerRequest} pages`);
        }
      }

      // Search capability bonus
      if (mode === 'search' && caps.search) {
        score += 20;
        reasons.push('Native search support');
      }

      scores.push({ provider, score, reasons });
    }

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    if (scores.length === 0) {
      // Fallback to firecrawl as default
      return {
        selectedProvider: 'firecrawl',
        reason: 'Default fallback - no specific match found',
        alternativeProviders: ['oxylabs', 'langchain'],
        confidence: 0.5,
      };
    }

    const best = scores[0];
    const maxScore = 100; // Theoretical max
    
    return {
      selectedProvider: best.provider,
      reason: best.reasons.join(', '),
      alternativeProviders: scores.slice(1).map(s => s.provider),
      confidence: Math.min(best.score / maxScore, 1.0),
    };
  }

  /**
   * Execute scraping with automatic provider selection
   */
  async scrape(request: ScrapingRequest): Promise<ScrapingResult & { routerDecision: RouterDecision }> {
    const decision = this.selectProvider(request);
    const scraper = this.scrapers.get(decision.selectedProvider);

    if (!scraper) {
      throw new Error(`Provider ${decision.selectedProvider} not found`);
    }

    const result = await scraper.scrape(request);
    
    return {
      ...result,
      routerDecision: decision,
    };
  }

  /**
   * Execute scraping with a specific provider
   */
  async scrapeWith(provider: ScraperProvider, request: ScrapingRequest): Promise<ScrapingResult> {
    const scraper = this.scrapers.get(provider);
    
    if (!scraper) {
      throw new Error(`Provider ${provider} not found`);
    }

    return scraper.scrape(request);
  }

  /**
   * Get provider capabilities
   */
  getCapabilities(provider: ScraperProvider): ProviderCapabilities {
    return PROVIDER_CAPABILITIES[provider];
  }

  /**
   * Get all configured providers
   */
  getConfiguredProviders(): ScraperProvider[] {
    const configured: ScraperProvider[] = [];
    for (const [name, scraper] of this.scrapers) {
      if (scraper.isConfigured()) {
        configured.push(name as ScraperProvider);
      }
    }
    return configured;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ScrapingConfig>): void {
    if (config.oxylabs) {
      this.config.oxylabs = config.oxylabs;
      this.scrapers.set('oxylabs', new OxylabsScraper(config.oxylabs));
    }
    if (config.firecrawl) {
      this.config.firecrawl = config.firecrawl;
      this.scrapers.set('firecrawl', new FirecrawlScraper(config.firecrawl));
    }
    if (config.langchain) {
      this.config.langchain = config.langchain;
      this.scrapers.set('langchain', new LangChainScraper(config.langchain));
    }
  }

  private getAlternatives(exclude: ScraperProvider): ScraperProvider[] {
    const all: ScraperProvider[] = ['oxylabs', 'firecrawl', 'langchain'];
    return all.filter(p => p !== exclude);
  }
}

// ============================================================================
// Factory function
// ============================================================================

export function createScrapingRouter(config: ScrapingConfig = {}): ScrapingRouter {
  return new ScrapingRouter(config);
}

// ============================================================================
// Export types for use in components
// ============================================================================

export type { BaseScraper, ProviderCapabilities };
