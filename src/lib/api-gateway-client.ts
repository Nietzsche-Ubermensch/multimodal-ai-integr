/**
 * API Gateway Client
 * Unified client for making secure API calls through the gateway
 * This prevents API key exposure in the frontend
 */

export interface ApiGatewayConfig {
  baseUrl: string;
  authToken: string;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface SearchOptions {
  threshold?: number;
  limit?: number;
  supabaseUrl: string;
  supabaseKey: string;
  embeddingModel?: string;
}

export interface VectorSearchResult {
  id: string;
  content: string;
  similarity: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface VectorSearchResponse {
  success: boolean;
  query: string;
  results: VectorSearchResult[];
  metadata: {
    resultCount: number;
    threshold: number;
    limit: number;
    embeddingModel: string;
    embeddingTime: number;
    searchTime: number;
    totalTime: number;
  };
}

export interface ChatCompletionResponse {
  id?: string;
  choices?: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface EmbeddingResponse {
  data: Array<{
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export class ApiGatewayClient {
  private baseUrl: string;
  private authToken: string;

  constructor(config: ApiGatewayConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.authToken = config.authToken;
  }

  /**
   * Generate embeddings for text
   * Uses server-side API to keep keys secure
   */
  async generateEmbedding(
    text: string,
    options: {
      provider?: string;
      model?: string;
    } = {}
  ): Promise<number[]> {
    const {
      provider = 'openai',
      model = 'text-embedding-3-small'
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({
          provider,
          model,
          input: text,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: { message: `HTTP ${response.status}` }
        }));
        throw new Error(error.error?.message || 'Embedding generation failed');
      }

      const data: EmbeddingResponse = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      throw new Error(
        `Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Perform vector similarity search
   * Generates embedding server-side and searches Supabase
   */
  async vectorSearch(
    query: string,
    options: SearchOptions
  ): Promise<VectorSearchResponse> {
    const {
      threshold = 0.7,
      limit = 5,
      supabaseUrl,
      supabaseKey,
      embeddingModel = 'text-embedding-3-small'
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/vector-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({
          query,
          threshold,
          limit,
          supabaseUrl,
          supabaseKey,
          embeddingModel,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: { message: `HTTP ${response.status}` }
        }));
        throw new Error(error.error?.message || 'Vector search failed');
      }

      const data: VectorSearchResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Vector search error:', error);
      throw new Error(
        `Failed to perform vector search: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate chat completion
   * Uses server-side API to keep keys secure
   */
  async chatCompletion(
    messages: Message[],
    model: string,
    options: ChatCompletionOptions & { provider?: string } = {}
  ): Promise<ChatCompletionResponse> {
    const {
      provider = 'openai',
      temperature,
      maxTokens,
      stream = false
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({
          provider,
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: { message: `HTTP ${response.status}` }
        }));
        throw new Error(error.error?.message || 'Chat completion failed');
      }

      if (stream) {
        // For streaming, return the response object for the caller to handle
        // The caller should process the ReadableStream from response.body
        return response as unknown as ChatCompletionResponse;
      }

      const data: ChatCompletionResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Chat completion error:', error);
      throw new Error(
        `Failed to generate chat completion: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Update base URL
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/$/, '');
  }

  /**
   * Get current configuration
   */
  getConfig(): ApiGatewayConfig {
    return {
      baseUrl: this.baseUrl,
      authToken: this.authToken,
    };
  }
}

/**
 * Create a new API Gateway client instance
 */
export function createApiGatewayClient(config: ApiGatewayConfig): ApiGatewayClient {
  return new ApiGatewayClient(config);
}

/**
 * Default client instance (can be configured once and reused)
 */
let defaultClient: ApiGatewayClient | null = null;

/**
 * Configure the default client
 */
export function configureDefaultClient(config: ApiGatewayConfig): void {
  defaultClient = new ApiGatewayClient(config);
}

/**
 * Get the default client (throws if not configured)
 */
export function getDefaultClient(): ApiGatewayClient {
  if (!defaultClient) {
    throw new Error(
      'Default API Gateway client not configured. Call configureDefaultClient() first.'
    );
  }
  return defaultClient;
}
