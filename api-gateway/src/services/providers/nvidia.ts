import axios from 'axios';
import config from '@/config/env';
import { ProviderError } from '@/middleware/errorHandler';
import { ChatRequest, ChatResponse } from './anthropic';
import logger from '@/utils/logger';

export class NvidiaService {
  private apiKey: string | undefined;
  private baseUrl = 'https://integrate.api.nvidia.com/v1';

  constructor() {
    this.apiKey = config.providers.nvidia;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    if (!this.apiKey) {
      throw new ProviderError('Nvidia NIM API key not configured', 'nvidia_nim');
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
      logger.error({ error: error.response?.data || error }, 'Nvidia NIM API error');
      throw new ProviderError(
        error.response?.data?.error?.message || 'Nvidia NIM API request failed',
        'nvidia_nim',
        error.response?.data
      );
    }
  }

  async *streamChat(request: ChatRequest): AsyncGenerator<any> {
    if (!this.apiKey) {
      throw new ProviderError('Nvidia NIM API key not configured', 'nvidia_nim');
    }

    throw new ProviderError('Streaming not yet implemented for Nvidia NIM', 'nvidia_nim');
  }
}
