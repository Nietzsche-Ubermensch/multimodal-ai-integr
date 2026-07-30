import axios from 'axios';
import config from '@/config/env';
import { ProviderError } from '@/middleware/errorHandler';
import { ChatRequest, ChatResponse } from './anthropic';
import logger from '@/utils/logger';

export class DeepSeekService {
  private apiKey: string | undefined;
  private baseUrl = 'https://api.deepseek.com/v1';

  constructor() {
    this.apiKey = config.providers.deepseek;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    if (!this.apiKey) {
      throw new ProviderError('DeepSeek API key not configured', 'deepseek');
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
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error: any) {
      logger.error(
        { error: error.response?.data || error },
        'DeepSeek API error',
      );
      throw new ProviderError(
        error.response?.data?.error?.message || 'DeepSeek API request failed',
        'deepseek',
        error.response?.data,
      );
    }
  }

  async *streamChat(request: ChatRequest): AsyncGenerator<any> {
    if (!this.apiKey) {
      throw new ProviderError('DeepSeek API key not configured', 'deepseek');
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
          stream: true,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'stream',
        },
      );

      let buffer = '';
      for await (const chunk of response.data) {
        buffer += chunk.toString();

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (line === '') continue;

          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              yield parsed;
            } catch (e) {
              logger.warn({ line }, 'Failed to parse DeepSeek stream chunk');
            }
          }
        }
      }
    } catch (error: any) {
      logger.error(
        { error: error.response?.data || error },
        'DeepSeek streaming error',
      );
      throw new ProviderError(
        error.response?.data?.error?.message || 'DeepSeek streaming failed',
        'deepseek',
        error.response?.data,
      );
    }
  }
}
