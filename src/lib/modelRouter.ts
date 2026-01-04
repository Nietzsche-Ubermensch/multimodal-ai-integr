/**
 * Model Router - Intelligent routing to AI providers through Supabase wrappers
 * Routes requests through Edge Functions to avoid CORS issues
 */

import { chat, type Provider, type ChatMessage } from './ai-service';

export interface ModelRequest {
  prompt: string;
  model?: string;
  task?: 'chat' | 'code' | 'reasoning' | 'vision' | 'rag';
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  messages?: Array<{ role: string; content: string }>;
}

export interface ModelRouterConfig {
  defaultModel: {
    chat: string;
    code: string;
    reasoning: string;
    vision: string;
    rag: string;
  };
  fallbackChain: string[];
  routingStrategy: 'cost' | 'speed' | 'quality' | 'auto';
}

export interface ModelResponse {
  content: string;
  model: string;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: {
    input: number;
    output: number;
    total: number;
  };
  latency: number;
  reasoning?: string;
}

// Model to provider mapping
const MODEL_PROVIDERS: Record<string, Provider> = {
  // Anthropic (use dated model IDs from https://docs.anthropic.com/en/docs/about-claude/models)
  'claude-3-5-sonnet-20241022': 'anthropic',
  'claude-3-5-haiku-20241022': 'anthropic',
  'claude-3-haiku-20240307': 'anthropic',
  'claude-3-opus-20240229': 'anthropic',
  'claude-sonnet-4-20250514': 'anthropic',
  'claude-opus-4-20250514': 'anthropic',
  // DeepSeek
  'deepseek-chat': 'deepseek',
  'deepseek-reasoner': 'deepseek',
  // XAI
  'grok-2': 'xai',
  'grok-beta': 'xai',
  'grok-4-1-fast-reasoning': 'xai',
  'grok-4-1-fast-non-reasoning': 'xai',
  'grok-code-fast-1': 'xai',
  // Gemini
  'gemini-1.5-flash': 'gemini',
  'gemini-1.5-pro': 'gemini',
  'gemini-2.0-flash': 'gemini',
  // Perplexity
  'llama-3.1-sonar-small-128k-online': 'perplexity',
  'llama-3.1-sonar-large-128k-online': 'perplexity',
  // OpenRouter (prefix with provider)
  'openai/gpt-4o': 'openrouter',
  'openai/gpt-4o-mini': 'openrouter',
  'meta-llama/llama-3.1-70b-instruct': 'openrouter',
};

function getProvider(model: string): Provider {
  // Check direct mapping
  if (MODEL_PROVIDERS[model]) {
    return MODEL_PROVIDERS[model];
  }

  // Check by prefix
  if (model.startsWith('claude')) return 'anthropic';
  if (model.startsWith('grok')) return 'xai';
  if (model.startsWith('deepseek')) return 'deepseek';
  if (model.startsWith('gemini')) return 'gemini';
  if (model.includes('/')) return 'openrouter'; // Has provider prefix

  // Default to openrouter for unknown models
  return 'openrouter';
}

function extractModelId(fullModel: string): string {
  // Remove provider prefix if present (e.g., "anthropic/claude-3" -> "claude-3")
  const parts = fullModel.split('/');
  return parts.length > 1 ? parts.slice(1).join('/') : fullModel;
}

export class ModelRouter {
  private config: ModelRouterConfig;

  constructor() {
    this.config = {
      defaultModel: {
        chat: 'claude-3-5-sonnet-20241022',
        code: 'deepseek-chat',
        reasoning: 'deepseek-reasoner',
        vision: 'gemini-1.5-pro',
        rag: 'deepseek-chat'
      },
      fallbackChain: [
        'claude-3-5-sonnet-20241022',
        'deepseek-chat',
        'gemini-1.5-flash',
      ],
      routingStrategy: 'auto'
    };
  }

  async route(request: ModelRequest): Promise<ModelResponse> {
    const selectedModel = this.selectModel(request);
    const fallbacks = [selectedModel, ...this.config.fallbackChain.filter(m => m !== selectedModel)];

    let lastError: Error | null = null;

    for (const model of fallbacks) {
      try {
        return await this.executeWithModel(model, request);
      } catch (error) {
        console.warn(`Model ${model} failed, trying fallback...`, error);
        lastError = error as Error;
      }
    }

    throw lastError || new Error('All models failed');
  }

  private selectModel(request: ModelRequest): string {
    if (request.model) {
      // Extract model ID if it has provider prefix
      return extractModelId(request.model);
    }

    if (request.task) {
      return this.config.defaultModel[request.task];
    }

    // Auto-detect task from prompt
    const prompt = request.prompt.toLowerCase();
    if (prompt.includes('```') || prompt.includes('code') || prompt.includes('function')) {
      return this.config.defaultModel.code;
    }
    if (prompt.includes('think') || prompt.includes('reason') || prompt.includes('step by step')) {
      return this.config.defaultModel.reasoning;
    }
    if (prompt.length > 2000) {
      return this.config.defaultModel.rag;
    }

    return this.config.defaultModel.chat;
  }

  private async executeWithModel(model: string, request: ModelRequest): Promise<ModelResponse> {
    const provider = getProvider(model);
    const modelId = extractModelId(model);

    const messages: ChatMessage[] = request.messages?.map(m => ({
      role: m.role as 'system' | 'user' | 'assistant',
      content: m.content,
    })) || [{ role: 'user', content: request.prompt }];

    const response = await chat({
      provider,
      model: modelId,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 4096,
      stream: false,
    });

    if (!response.success) {
      throw new Error(response.error || 'Request failed');
    }

    return {
      content: response.content,
      model: response.model,
      tokens: response.tokens,
      cost: response.cost,
      latency: response.latency,
    };
  }

  updateConfig(updates: Partial<ModelRouterConfig>) {
    this.config = { ...this.config, ...updates };
  }

  getConfig(): ModelRouterConfig {
    return { ...this.config };
  }
}

export const modelRouter = new ModelRouter();
