import axios from 'axios';
import config from '@/config/env';
import { ProviderError } from '@/middleware/errorHandler';
import { ChatRequest, ChatResponse } from './anthropic';
import logger from '@/utils/logger';

export interface EmbeddingRequest {
  model: string;
  input: string | string[];
}

export interface EmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterService {
  private apiKey: string | undefined;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = config.providers.openrouter;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    if (!this.apiKey) {
      throw new ProviderError('OpenRouter API key not configured', 'openrouter');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: request.model,
          messages: request.messages,
          temperature: request.temperature,
          max_tokens: request.max_tokens,
          top_p: request.top_p,
          stream: false,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': config.server.baseUrl,
            'X-Title': 'AI Integration Gateway',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error({ error: error.response?.data || error }, 'OpenRouter API error');
      throw new ProviderError(
        error.response?.data?.error?.message || 'OpenRouter API request failed',
        'openrouter',
        error.response?.data
      );
    }
  }

  async embeddings(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    if (!this.apiKey) {
      throw new ProviderError('OpenRouter API key not configured', 'openrouter');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/embeddings`,
        {
          model: request.model,
          input: request.input,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': config.server.baseUrl,
            'X-Title': 'AI Integration Gateway',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error({ error: error.response?.data || error }, 'OpenRouter Embeddings API error');
      throw new ProviderError(
        error.response?.data?.error?.message || 'OpenRouter embeddings request failed',
        'openrouter',
        error.response?.data
      );
    }
  }

  async *streamChat(request: ChatRequest): AsyncGenerator<any> {
    if (!this.apiKey) {
      throw new ProviderError('OpenRouter API key not configured', 'openrouter');
    }

    throw new ProviderError('Streaming not yet implemented for OpenRouter', 'openrouter');
  }
}
