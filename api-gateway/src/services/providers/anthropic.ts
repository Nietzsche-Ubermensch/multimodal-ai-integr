import Anthropic from '@anthropic-ai/sdk';
import config from '@/config/env';
import { ProviderError } from '@/middleware/errorHandler';
import logger from '@/utils/logger';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | any[];
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export interface ChatResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class AnthropicService {
  private client: Anthropic | null = null;

  constructor() {
    const apiKey = config.providers.anthropic;
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    }
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    if (!this.client) {
      throw new ProviderError('Anthropic API key not configured', 'anthropic');
    }

    try {
      const systemMessage = request.messages.find(m => m.role === 'system');
      const userMessages = request.messages.filter(m => m.role !== 'system');

      const response = await this.client.messages.create({
        model: request.model,
        max_tokens: request.max_tokens || 4096,
        temperature: request.temperature,
        top_p: request.top_p,
        system: systemMessage?.content as string,
        messages: userMessages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      });

      return {
        id: response.id,
        model: response.model,
        choices: [
          {
            message: {
              role: 'assistant',
              content: response.content[0].type === 'text' ? response.content[0].text : '',
            },
            finish_reason: response.stop_reason || 'stop',
          },
        ],
        usage: {
          prompt_tokens: response.usage.input_tokens,
          completion_tokens: response.usage.output_tokens,
          total_tokens: response.usage.input_tokens + response.usage.output_tokens,
        },
      };
    } catch (error: any) {
      logger.error({ error }, 'Anthropic API error');
      throw new ProviderError(
        error.message || 'Anthropic API request failed',
        'anthropic',
        error
      );
    }
  }

  async *streamChat(request: ChatRequest): AsyncGenerator<any> {
    if (!this.client) {
      throw new ProviderError('Anthropic API key not configured', 'anthropic');
    }

    try {
      const systemMessage = request.messages.find(m => m.role === 'system');
      const userMessages = request.messages.filter(m => m.role !== 'system');

      const stream = await this.client.messages.create({
        model: request.model,
        max_tokens: request.max_tokens || 4096,
        temperature: request.temperature,
        top_p: request.top_p,
        system: systemMessage?.content as string,
        messages: userMessages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        stream: true,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          yield {
            delta: {
              content: event.delta.text,
            },
          };
        }
      }
    } catch (error: any) {
      logger.error({ error }, 'Anthropic streaming error');
      throw new ProviderError(
        error.message || 'Anthropic streaming failed',
        'anthropic',
        error
      );
    }
  }
}
