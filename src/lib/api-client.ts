import OpenAI from 'openai';

export interface ApiConfig {
  provider: string;
  apiKey: string;
  baseURL?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionParams {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export class ModelApiClient {
  private clients: Map<string, OpenAI> = new Map();

  private getBaseURL(provider: string): string {
    const urls: Record<string, string> = {
      openai: 'https://api.openai.com/v1',
      anthropic: 'https://api.anthropic.com/v1',
      openrouter: 'https://openrouter.ai/api/v1',
      perplexity: 'https://api.perplexity.ai',
      deepseek: 'https://api.deepseek.com',
      xai: 'https://api.x.ai/v1',
      nvidia_nim: 'https://integrate.api.nvidia.com/v1',
      huggingface: 'https://api-inference.huggingface.co/v1',
    };
    return urls[provider] || '';
  }

  private getClient(provider: string, apiKey: string): OpenAI {
    const key = `${provider}:${apiKey.substring(0, 10)}`;
    
    if (!this.clients.has(key)) {
      const baseURL = this.getBaseURL(provider);
      const client = new OpenAI({
        apiKey,
        baseURL,
        dangerouslyAllowBrowser: true, // Only for demo - use backend proxy in production
      });
      this.clients.set(key, client);
    }

    return this.clients.get(key)!;
  }

  async chatCompletion(
    config: ApiConfig,
    params: ChatCompletionParams
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    const client = this.getClient(config.provider, config.apiKey);

    const response = await client.chat.completions.create({
      model: params.model,
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 1000,
      stream: false,
    });

    return response;
  }

  async *streamChatCompletion(
    config: ApiConfig,
    params: ChatCompletionParams
  ): AsyncGenerator<string, void, unknown> {
    const client = this.getClient(config.provider, config.apiKey);

    const stream = await client.chat.completions.create({
      model: params.model,
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 1000,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  async validateApiKey(provider: string, apiKey: string): Promise<{
    valid: boolean;
    error?: string;
    models?: string[];
  }> {
    try {
      const client = this.getClient(provider, apiKey);
      
      const testModel = this.getTestModel(provider);
      
      await client.chat.completions.create({
        model: testModel,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
      });

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private getTestModel(provider: string): string {
    const models: Record<string, string> = {
      openai: 'gpt-3.5-turbo',
      anthropic: 'claude-3-haiku-20240307',
      openrouter: 'meta-llama/llama-3.2-1b-instruct:free',
      perplexity: 'sonar',
      deepseek: 'deepseek-chat',
      xai: 'grok-beta',
      nvidia_nim: 'meta/llama3-8b-instruct',
      huggingface: 'meta-llama/Meta-Llama-3-8B-Instruct',
    };
    return models[provider] || 'gpt-3.5-turbo';
  }
}

export const apiClient = new ModelApiClient();
