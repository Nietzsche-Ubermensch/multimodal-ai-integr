/**
 * LiteLLM + Langfuse Integration Service
 * 
 * Provides unified LLM access via LiteLLM and observability via Langfuse
 */

import type { AIProvider, ModelResponse, TokenUsage } from '@/types/modelhub';

// ============================================================================
// LiteLLM Configuration
// ============================================================================

export interface LiteLLMConfig {
  proxyBaseUrl?: string; // e.g., http://localhost:4000
  apiKey?: string;       // LiteLLM proxy API key
  defaultModel?: string;
}

export interface LiteLLMModel {
  id: string;
  name: string;
  provider: string;
  litellmId: string; // The model ID used by LiteLLM
  contextWindow: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
}

// Comprehensive model list supported via LiteLLM
export const LITELLM_MODELS: LiteLLMModel[] = [
  // OpenAI
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'openai', litellmId: 'gpt-4o', contextWindow: 128000, inputCostPer1M: 2.5, outputCostPer1M: 10.0 },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', litellmId: 'gpt-4o-mini', contextWindow: 128000, inputCostPer1M: 0.15, outputCostPer1M: 0.6 },
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', litellmId: 'gpt-4-turbo', contextWindow: 128000, inputCostPer1M: 10.0, outputCostPer1M: 30.0 },
  { id: 'openai/o1-preview', name: 'O1 Preview', provider: 'openai', litellmId: 'o1-preview', contextWindow: 128000, inputCostPer1M: 15.0, outputCostPer1M: 60.0 },
  { id: 'openai/o1-mini', name: 'O1 Mini', provider: 'openai', litellmId: 'o1-mini', contextWindow: 128000, inputCostPer1M: 3.0, outputCostPer1M: 12.0 },
  
  // Anthropic
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', litellmId: 'claude-3-5-sonnet-20241022', contextWindow: 200000, inputCostPer1M: 3.0, outputCostPer1M: 15.0 },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic', litellmId: 'claude-3-opus-20240229', contextWindow: 200000, inputCostPer1M: 15.0, outputCostPer1M: 75.0 },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'anthropic', litellmId: 'claude-3-haiku-20240307', contextWindow: 200000, inputCostPer1M: 0.25, outputCostPer1M: 1.25 },
  
  // DeepSeek
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', provider: 'deepseek', litellmId: 'deepseek/deepseek-chat', contextWindow: 64000, inputCostPer1M: 0.14, outputCostPer1M: 0.28 },
  { id: 'deepseek/deepseek-reasoner', name: 'DeepSeek R1', provider: 'deepseek', litellmId: 'deepseek/deepseek-reasoner', contextWindow: 64000, inputCostPer1M: 0.55, outputCostPer1M: 2.19 },
  
  // Google
  { id: 'google/gemini-pro', name: 'Gemini Pro', provider: 'google', litellmId: 'gemini/gemini-pro', contextWindow: 32000, inputCostPer1M: 0.5, outputCostPer1M: 1.5 },
  { id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google', litellmId: 'gemini/gemini-1.5-pro', contextWindow: 1000000, inputCostPer1M: 1.25, outputCostPer1M: 5.0 },
  { id: 'google/gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'google', litellmId: 'gemini/gemini-1.5-flash', contextWindow: 1000000, inputCostPer1M: 0.075, outputCostPer1M: 0.3 },
  
  // Groq
  { id: 'groq/llama-3.1-70b', name: 'Llama 3.1 70B (Groq)', provider: 'groq', litellmId: 'groq/llama-3.1-70b-versatile', contextWindow: 128000, inputCostPer1M: 0.59, outputCostPer1M: 0.79 },
  { id: 'groq/llama-3.1-8b', name: 'Llama 3.1 8B (Groq)', provider: 'groq', litellmId: 'groq/llama-3.1-8b-instant', contextWindow: 128000, inputCostPer1M: 0.05, outputCostPer1M: 0.08 },
  { id: 'groq/mixtral-8x7b', name: 'Mixtral 8x7B (Groq)', provider: 'groq', litellmId: 'groq/mixtral-8x7b-32768', contextWindow: 32768, inputCostPer1M: 0.24, outputCostPer1M: 0.24 },
  
  // Mistral
  { id: 'mistral/mistral-large', name: 'Mistral Large', provider: 'mistral', litellmId: 'mistral/mistral-large-latest', contextWindow: 128000, inputCostPer1M: 3.0, outputCostPer1M: 9.0 },
  { id: 'mistral/mistral-small', name: 'Mistral Small', provider: 'mistral', litellmId: 'mistral/mistral-small-latest', contextWindow: 128000, inputCostPer1M: 1.0, outputCostPer1M: 3.0 },
  
  // Together AI
  { id: 'together/llama-3.1-405b', name: 'Llama 3.1 405B (Together)', provider: 'together', litellmId: 'together_ai/meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo', contextWindow: 130000, inputCostPer1M: 3.5, outputCostPer1M: 3.5 },
  { id: 'together/qwen-2.5-72b', name: 'Qwen 2.5 72B (Together)', provider: 'together', litellmId: 'together_ai/Qwen/Qwen2.5-72B-Instruct-Turbo', contextWindow: 32000, inputCostPer1M: 0.6, outputCostPer1M: 0.6 },
  
  // Perplexity
  { id: 'perplexity/sonar-large', name: 'Sonar Large (Perplexity)', provider: 'perplexity', litellmId: 'perplexity/llama-3.1-sonar-large-128k-online', contextWindow: 127072, inputCostPer1M: 1.0, outputCostPer1M: 1.0 },
  
  // xAI
  { id: 'xai/grok-2', name: 'Grok 2', provider: 'xai', litellmId: 'xai/grok-2', contextWindow: 128000, inputCostPer1M: 2.0, outputCostPer1M: 10.0 },
  
  // Cohere
  { id: 'cohere/command-r-plus', name: 'Command R+', provider: 'cohere', litellmId: 'cohere/command-r-plus', contextWindow: 128000, inputCostPer1M: 2.5, outputCostPer1M: 10.0 },
  { id: 'cohere/command-r', name: 'Command R', provider: 'cohere', litellmId: 'cohere/command-r', contextWindow: 128000, inputCostPer1M: 0.15, outputCostPer1M: 0.6 },
  
  // AWS Bedrock
  { id: 'bedrock/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Bedrock)', provider: 'bedrock', litellmId: 'bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0', contextWindow: 200000, inputCostPer1M: 3.0, outputCostPer1M: 15.0 },
  { id: 'bedrock/llama-3.1-70b', name: 'Llama 3.1 70B (Bedrock)', provider: 'bedrock', litellmId: 'bedrock/meta.llama3-1-70b-instruct-v1:0', contextWindow: 128000, inputCostPer1M: 0.72, outputCostPer1M: 0.72 },
  
  // Azure OpenAI
  { id: 'azure/gpt-4o', name: 'GPT-4o (Azure)', provider: 'azure', litellmId: 'azure/gpt-4o', contextWindow: 128000, inputCostPer1M: 2.5, outputCostPer1M: 10.0 },
  
  // Ollama (local)
  { id: 'ollama/llama3.1', name: 'Llama 3.1 (Ollama)', provider: 'ollama', litellmId: 'ollama/llama3.1', contextWindow: 128000, inputCostPer1M: 0, outputCostPer1M: 0 },
  { id: 'ollama/mistral', name: 'Mistral (Ollama)', provider: 'ollama', litellmId: 'ollama/mistral', contextWindow: 32000, inputCostPer1M: 0, outputCostPer1M: 0 },
];

// ============================================================================
// Langfuse Configuration
// ============================================================================

export interface LangfuseConfig {
  publicKey: string;
  secretKey: string;
  baseUrl?: string; // Default: https://cloud.langfuse.com
}

export interface LangfuseTrace {
  id: string;
  name: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

export interface LangfuseSpan {
  traceId: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  input?: unknown;
  output?: unknown;
  metadata?: Record<string, unknown>;
  level?: 'DEBUG' | 'DEFAULT' | 'WARNING' | 'ERROR';
}

export interface LangfuseGeneration {
  traceId: string;
  name: string;
  model: string;
  modelParameters?: Record<string, unknown>;
  input: unknown;
  output?: string;
  usage?: {
    input: number;
    output: number;
    total: number;
  };
  startTime: Date;
  endTime?: Date;
  completionStartTime?: Date;
  level?: 'DEBUG' | 'DEFAULT' | 'WARNING' | 'ERROR';
}

// ============================================================================
// LiteLLM Client
// ============================================================================

export class LiteLLMClient {
  private config: LiteLLMConfig;
  private langfuse?: LangfuseClient;

  constructor(config: LiteLLMConfig, langfuseConfig?: LangfuseConfig) {
    this.config = {
      proxyBaseUrl: config.proxyBaseUrl || 'http://localhost:4000',
      ...config,
    };
    
    if (langfuseConfig) {
      this.langfuse = new LangfuseClient(langfuseConfig);
    }
  }

  /**
   * Call any LLM through LiteLLM's unified interface
   */
  async completion(
    model: string,
    messages: Array<{ role: string; content: string }>,
    options?: {
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
      userId?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<{
    content: string;
    usage: TokenUsage;
    model: string;
    latencyMs: number;
    traceId?: string;
  }> {
    const startTime = Date.now();
    let traceId: string | undefined;

    // Start Langfuse trace if configured
    if (this.langfuse) {
      traceId = await this.langfuse.createTrace({
        name: `LiteLLM: ${model}`,
        userId: options?.userId,
        metadata: options?.metadata,
        tags: ['litellm', model.split('/')[0]],
      });
    }

    try {
      // Determine the endpoint
      const endpoint = this.config.proxyBaseUrl 
        ? `${this.config.proxyBaseUrl}/v1/chat/completions`
        : this.getDirectEndpoint(model);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const modelInfo = LITELLM_MODELS.find(m => m.id === model || m.litellmId === model);
      const litellmModelId = modelInfo?.litellmId || model;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: litellmModelId,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2048,
          stream: false,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `LiteLLM error: ${response.status}`);
      }

      const data = await response.json();
      const latencyMs = Date.now() - startTime;

      const result = {
        content: data.choices?.[0]?.message?.content || '',
        usage: {
          input: data.usage?.prompt_tokens || 0,
          output: data.usage?.completion_tokens || 0,
          total: data.usage?.total_tokens || 0,
        },
        model: data.model || model,
        latencyMs,
        traceId,
      };

      // Log generation to Langfuse
      if (this.langfuse && traceId) {
        await this.langfuse.logGeneration({
          traceId,
          name: 'completion',
          model: result.model,
          modelParameters: {
            temperature: options?.temperature ?? 0.7,
            maxTokens: options?.maxTokens ?? 2048,
          },
          input: messages,
          output: result.content,
          usage: result.usage,
          startTime: new Date(startTime),
          endTime: new Date(),
        });
      }

      return result;
    } catch (error) {
      // Log error to Langfuse
      if (this.langfuse && traceId) {
        await this.langfuse.logSpan({
          traceId,
          name: 'error',
          startTime: new Date(startTime),
          endTime: new Date(),
          metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
          level: 'ERROR',
        });
      }
      throw error;
    }
  }

  /**
   * Get embeddings through LiteLLM
   */
  async embeddings(
    model: string,
    input: string | string[]
  ): Promise<{
    embeddings: number[][];
    usage: { totalTokens: number };
    model: string;
  }> {
    const endpoint = this.config.proxyBaseUrl 
      ? `${this.config.proxyBaseUrl}/v1/embeddings`
      : 'https://api.openai.com/v1/embeddings';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        input: Array.isArray(input) ? input : [input],
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Embeddings error: ${response.status}`);
    }

    const data = await response.json();

    return {
      embeddings: data.data.map((d: { embedding: number[] }) => d.embedding),
      usage: { totalTokens: data.usage?.total_tokens || 0 },
      model: data.model || model,
    };
  }

  /**
   * List available models from LiteLLM proxy
   */
  async listModels(): Promise<string[]> {
    if (!this.config.proxyBaseUrl) {
      return LITELLM_MODELS.map(m => m.id);
    }

    try {
      const response = await fetch(`${this.config.proxyBaseUrl}/v1/models`, {
        headers: this.config.apiKey 
          ? { 'Authorization': `Bearer ${this.config.apiKey}` }
          : {},
      });

      if (!response.ok) {
        return LITELLM_MODELS.map(m => m.id);
      }

      const data = await response.json();
      return data.data?.map((m: { id: string }) => m.id) || [];
    } catch {
      return LITELLM_MODELS.map(m => m.id);
    }
  }

  private getDirectEndpoint(model: string): string {
    const provider = model.split('/')[0];
    const endpoints: Record<string, string> = {
      openai: 'https://api.openai.com/v1/chat/completions',
      anthropic: 'https://api.anthropic.com/v1/messages',
      deepseek: 'https://api.deepseek.com/v1/chat/completions',
      groq: 'https://api.groq.com/openai/v1/chat/completions',
      mistral: 'https://api.mistral.ai/v1/chat/completions',
      cohere: 'https://api.cohere.ai/v1/chat',
      xai: 'https://api.x.ai/v1/chat/completions',
    };
    return endpoints[provider] || 'https://api.openai.com/v1/chat/completions';
  }
}

// ============================================================================
// Langfuse Client
// ============================================================================

export class LangfuseClient {
  private config: LangfuseConfig;
  private baseUrl: string;

  constructor(config: LangfuseConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://cloud.langfuse.com';
  }

  private getAuthHeader(): string {
    const credentials = `${this.config.publicKey}:${this.config.secretKey}`;
    return `Basic ${btoa(credentials)}`;
  }

  /**
   * Create a new trace
   */
  async createTrace(trace: Omit<LangfuseTrace, 'id'>): Promise<string> {
    const id = crypto.randomUUID();
    
    try {
      const response = await fetch(`${this.baseUrl}/api/public/traces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
        },
        body: JSON.stringify({
          id,
          name: trace.name,
          userId: trace.userId,
          metadata: trace.metadata,
          tags: trace.tags,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.warn('Langfuse trace creation failed:', response.status);
      }
    } catch (error) {
      console.warn('Langfuse trace creation error:', error);
    }

    return id;
  }

  /**
   * Log a generation (LLM call)
   */
  async logGeneration(generation: LangfuseGeneration): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/public/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
        },
        body: JSON.stringify({
          traceId: generation.traceId,
          name: generation.name,
          model: generation.model,
          modelParameters: generation.modelParameters,
          input: generation.input,
          output: generation.output,
          usage: generation.usage,
          startTime: generation.startTime.toISOString(),
          endTime: generation.endTime?.toISOString(),
          completionStartTime: generation.completionStartTime?.toISOString(),
          level: generation.level || 'DEFAULT',
        }),
      });
    } catch (error) {
      console.warn('Langfuse generation logging error:', error);
    }
  }

  /**
   * Log a span (arbitrary event)
   */
  async logSpan(span: LangfuseSpan): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/public/spans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
        },
        body: JSON.stringify({
          traceId: span.traceId,
          name: span.name,
          startTime: span.startTime.toISOString(),
          endTime: span.endTime?.toISOString(),
          input: span.input,
          output: span.output,
          metadata: span.metadata,
          level: span.level || 'DEFAULT',
        }),
      });
    } catch (error) {
      console.warn('Langfuse span logging error:', error);
    }
  }

  /**
   * Log user feedback/score
   */
  async logScore(
    traceId: string,
    name: string,
    value: number,
    comment?: string
  ): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/public/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
        },
        body: JSON.stringify({
          traceId,
          name,
          value,
          comment,
        }),
      });
    } catch (error) {
      console.warn('Langfuse score logging error:', error);
    }
  }

  /**
   * Get prompts from Langfuse prompt management
   */
  async getPrompt(name: string, version?: number): Promise<{
    name: string;
    version: number;
    prompt: string;
    config?: Record<string, unknown>;
  } | null> {
    try {
      const url = version 
        ? `${this.baseUrl}/api/public/prompts/${name}?version=${version}`
        : `${this.baseUrl}/api/public/prompts/${name}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        return null;
      }

      return response.json();
    } catch (error) {
      console.warn('Langfuse prompt fetch error:', error);
      return null;
    }
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createLiteLLMClient(
  config: LiteLLMConfig,
  langfuseConfig?: LangfuseConfig
): LiteLLMClient {
  return new LiteLLMClient(config, langfuseConfig);
}

export function createLangfuseClient(config: LangfuseConfig): LangfuseClient {
  return new LangfuseClient(config);
}

// ============================================================================
// Utility Functions
// ============================================================================

export function getLiteLLMModelInfo(modelId: string): LiteLLMModel | undefined {
  return LITELLM_MODELS.find(m => m.id === modelId || m.litellmId === modelId);
}

export function getLiteLLMModelsByProvider(provider: string): LiteLLMModel[] {
  return LITELLM_MODELS.filter(m => m.provider === provider);
}

export function calculateLiteLLMCost(
  model: LiteLLMModel,
  usage: TokenUsage
): number {
  const inputCost = (usage.input / 1_000_000) * model.inputCostPer1M;
  const outputCost = (usage.output / 1_000_000) * model.outputCostPer1M;
  return inputCost + outputCost;
}

/**
 * Get LiteLLM model format string for different providers
 */
export function getLiteLLMModelString(provider: string, model: string): string {
  const prefixes: Record<string, string> = {
    openai: '',
    anthropic: 'anthropic/',
    deepseek: 'deepseek/',
    groq: 'groq/',
    mistral: 'mistral/',
    google: 'gemini/',
    together: 'together_ai/',
    perplexity: 'perplexity/',
    cohere: 'cohere/',
    bedrock: 'bedrock/',
    azure: 'azure/',
    ollama: 'ollama/',
    xai: 'xai/',
  };
  
  const prefix = prefixes[provider] || '';
  return `${prefix}${model}`;
}
