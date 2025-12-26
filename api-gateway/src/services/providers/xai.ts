import axios from 'axios';
import config from '@/config/env';
import { ProviderError } from '@/middleware/errorHandler';
import { ChatRequest, ChatResponse } from './anthropic';
import logger from '@/utils/logger';

export class XAIService {
  private apiKey: string | undefined;
  private baseUrl = 'https://api.x.ai/v1';

  constructor() {
    this.apiKey = config.providers.xai;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    if (!this.apiKey) {
      throw new ProviderError('xAI API key not configured', 'xai');
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
          },
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error({ error: error.response?.data || error }, 'xAI API error');
      throw new ProviderError(
        error.response?.data?.error?.message || 'xAI API request failed',
        'xai',
        error.response?.data
      );
    }
  }

  async *streamChat(request: ChatRequest): AsyncGenerator<any> {
    if (!this.apiKey) {
      throw new ProviderError('xAI API key not configured', 'xai');
    }

    throw new ProviderError('Streaming not yet implemented for xAI', 'xai');
  }
}
