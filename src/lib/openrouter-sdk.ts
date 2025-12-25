import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, streamText } from 'ai';

export interface OpenRouterConfig {
  apiKey: string;
  baseURL?: string;
  defaultHeaders?: Record<string, string>;
}

export interface StreamOptions {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  onChunk?: (text: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

export class OpenRouterSDK {
  private client: ReturnType<typeof createOpenRouter>;
  private apiKey: string;

  constructor(config: OpenRouterConfig) {
    this.apiKey = config.apiKey;
    this.client = createOpenRouter({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      headers: {
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Multimodal AI Integration Platform',
        ...config.defaultHeaders,
      },
    });
  }

  async chat(options: StreamOptions): Promise<string> {
    try {
      const { text } = await generateText({
        model: this.client(options.model),
        messages: options.messages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
        temperature: options.temperature ?? 0.7,
      });

      return text;
    } catch (error) {
      console.error('OpenRouter SDK Error:', error);
      throw error;
    }
  }

  async streamChat(options: StreamOptions): Promise<void> {
    try {
      const { textStream } = await streamText({
        model: this.client(options.model),
        messages: options.messages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
        temperature: options.temperature ?? 0.7,
      });

      let fullText = '';
      
      for await (const chunk of textStream) {
        fullText += chunk;
        if (options.onChunk) {
          options.onChunk(chunk);
        }
      }

      if (options.onComplete) {
        options.onComplete(fullText);
      }
    } catch (error) {
      if (options.onError) {
        options.onError(error as Error);
      }
      throw error;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.map((model: any) => model.id);
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  }
}

export async function testOpenRouterSDK(apiKey: string, model: string = 'openai/gpt-3.5-turbo'): Promise<{
  success: boolean;
  response?: string;
  error?: string;
  latency: number;
}> {
  const startTime = Date.now();

  try {
    const sdk = new OpenRouterSDK({ apiKey });
    
    const response = await sdk.chat({
      model,
      messages: [
        { role: 'user', content: 'Say "Hello from OpenRouter SDK!" in exactly 5 words.' }
      ],
      temperature: 0.7,
      maxTokens: 50,
    });

    return {
      success: true,
      response,
      latency: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - startTime,
    };
  }
}
