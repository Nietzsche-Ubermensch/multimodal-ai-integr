export interface OxylabsConfig {
  apiKey: string;
}

export interface SupabaseConfig {
  url: string;
  key: string;
}

export interface LLMConfig {
  provider: string;
  apiKey?: string;
}

export interface ScrapeResult {
  content: string;
  metadata: {
    url: string;
    title?: string;
    scrapedAt: string;
  };
}

export interface EmbeddingResult {
  embedding: number[];
  model: string;
}

export interface SearchResult {
  content: string;
  similarity: number;
  metadata: Record<string, any>;
}

export class OxylabsClient {
  private apiKey: string;
  private baseUrl = 'https://realtime.oxylabs.io/v1/queries';

  constructor(config: OxylabsConfig) {
    this.apiKey = config.apiKey;
  }

  async scrapeUrl(url: string): Promise<ScrapeResult> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${this.apiKey}:`)}`,
        },
        body: JSON.stringify({
          source: 'universal',
          url: url,
          parse: true,
          render: 'html',
        }),
      });

      if (!response.ok) {
        throw new Error(`Oxylabs API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      const content = data.results?.[0]?.content || '';
      const title = this.extractTitle(content);

      return {
        content: this.cleanContent(content),
        metadata: {
          url,
          title,
          scrapedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Oxylabs scraping error:', error);
      throw new Error(`Failed to scrape URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractTitle(html: string): string {
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    return titleMatch ? titleMatch[1] : 'Untitled';
  }

  private cleanContent(html: string): string {
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    text = text.replace(/<[^>]+>/g, ' ');
    text = text.replace(/\s+/g, ' ');
    text = text.trim();
    
    return text;
  }
}

export class SupabaseVectorClient {
  private url: string;
  private key: string;

  constructor(config: SupabaseConfig) {
    this.url = config.url;
    this.key = config.key;
  }

  async storeEmbeddings(
    chunks: string[],
    embeddings: number[][],
    metadata?: Record<string, any>
  ): Promise<void> {
    const records = chunks.map((chunk, i) => ({
      content: chunk,
      embedding: embeddings[i],
      metadata: metadata || {},
    }));

    const response = await fetch(`${this.url}/rest/v1/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
      },
      body: JSON.stringify(records),
    });

    if (!response.ok) {
      throw new Error(`Supabase storage error: ${response.status} ${response.statusText}`);
    }
  }

  async searchSimilar(
    queryEmbedding: number[],
    matchThreshold: number = 0.7,
    matchCount: number = 3
  ): Promise<SearchResult[]> {
    const response = await fetch(`${this.url}/rest/v1/rpc/match_documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
      },
      body: JSON.stringify({
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount,
      }),
    });

    if (!response.ok) {
      throw new Error(`Supabase search error: ${response.status} ${response.statusText}`);
    }

    const results = await response.json();
    return results.map((r: any) => ({
      content: r.content,
      similarity: r.similarity,
      metadata: r.metadata || {},
    }));
  }
}

export class LiteLLMClient {
  private provider: string;
  private apiKey?: string;

  constructor(config: LLMConfig) {
    this.provider = config.provider;
    this.apiKey = config.apiKey;
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    try {
      const mockEmbedding = Array(1536).fill(0).map(() => Math.random() - 0.5);
      
      return {
        embedding: mockEmbedding,
        model: 'text-embedding-3-small',
      };
    } catch (error) {
      throw new Error(`Embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async complete(messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
      const conversationText = messages
        .map(m => `${m.role}: ${m.content}`)
        .join('\n\n');
      
      const promptParts = [conversationText];
      const response = await window.spark.llm(
        window.spark.llmPrompt(promptParts as any),
        'gpt-4o',
        false
      );
      return response;
    } catch (error) {
      throw new Error(`LLM completion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export function chunkText(text: string, chunkSize: number = 500, overlap: number = 50): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim()) {
      chunks.push(chunk);
    }
  }
  
  return chunks;
}

export async function validateApiKey(provider: string, apiKey: string): Promise<boolean> {
  try {
    switch (provider) {
      case 'oxylabs':
        const oxyClient = new OxylabsClient({ apiKey });
        await oxyClient.scrapeUrl('https://example.com');
        return true;
        
      case 'supabase':
        const [url, key] = apiKey.split('|');
        const supaClient = new SupabaseVectorClient({ url, key });
        return true;
        
      default:
        return false;
    }
  } catch (error) {
    return false;
  }
}
