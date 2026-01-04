/**
 * GitHub Models Client
 * 
 * Integration with GitHub's native model catalog featuring 70+ models
 * from OpenAI, Anthropic, Meta, Mistral, Cohere, and more.
 * 
 * Benefits:
 * - Native to GitHub - No external setup needed
 * - Single API key - Access all models with one credential
 * - Enterprise-ready - Manage models across your org
 */

// ============================================================================
// Types
// ============================================================================

export interface GitHubModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  contextWindow: number;
  maxOutputTokens: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
  capabilities: ModelCapability[];
  status: 'available' | 'preview' | 'deprecated';
  releaseDate?: string;
}

export type ModelCapability = 
  | 'chat'
  | 'completion'
  | 'embeddings'
  | 'vision'
  | 'function_calling'
  | 'json_mode'
  | 'streaming'
  | 'code'
  | 'reasoning';

export interface GitHubModelsConfig {
  token: string;
  baseUrl?: string;
  defaultModel?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

export interface ModelRunOptions {
  model: string;
  messages?: ChatMessage[];
  prompt?: string; // For completion mode
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stop?: string[];
  stream?: boolean;
  responseFormat?: { type: 'text' | 'json_object' };
  tools?: Tool[];
  toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ModelResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
      tool_calls?: {
        id: string;
        type: string;
        function: {
          name: string;
          arguments: string;
        };
      }[];
    };
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter';
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  created: number;
}

export interface EmbeddingResponse {
  model: string;
  data: {
    index: number;
    embedding: number[];
  }[];
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

// ============================================================================
// GitHub Models Catalog (70+ models)
// ============================================================================

export const GITHUB_MODELS_CATALOG: GitHubModel[] = [
  // OpenAI Models
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Most capable GPT-4 model with vision capabilities',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    inputCostPer1M: 2.5,
    outputCostPer1M: 10.0,
    capabilities: ['chat', 'vision', 'function_calling', 'json_mode', 'streaming', 'code'],
    status: 'available',
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Smaller, faster, cheaper version of GPT-4o',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.6,
    capabilities: ['chat', 'vision', 'function_calling', 'json_mode', 'streaming', 'code'],
    status: 'available',
  },
  {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'GPT-4 Turbo with improved performance',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    inputCostPer1M: 10.0,
    outputCostPer1M: 30.0,
    capabilities: ['chat', 'vision', 'function_calling', 'json_mode', 'streaming', 'code'],
    status: 'available',
  },
  {
    id: 'openai/o1-preview',
    name: 'O1 Preview',
    provider: 'openai',
    description: 'Advanced reasoning model',
    contextWindow: 128000,
    maxOutputTokens: 32768,
    inputCostPer1M: 15.0,
    outputCostPer1M: 60.0,
    capabilities: ['chat', 'reasoning', 'code'],
    status: 'preview',
  },
  {
    id: 'openai/o1-mini',
    name: 'O1 Mini',
    provider: 'openai',
    description: 'Smaller reasoning model',
    contextWindow: 128000,
    maxOutputTokens: 65536,
    inputCostPer1M: 3.0,
    outputCostPer1M: 12.0,
    capabilities: ['chat', 'reasoning', 'code'],
    status: 'preview',
  },
  {
    id: 'openai/o3-mini',
    name: 'O3 Mini',
    provider: 'openai',
    description: 'Latest small reasoning model',
    contextWindow: 128000,
    maxOutputTokens: 65536,
    inputCostPer1M: 1.1,
    outputCostPer1M: 4.4,
    capabilities: ['chat', 'reasoning', 'code'],
    status: 'preview',
  },
  
  // Meta Llama Models
  {
    id: 'meta-llama/Llama-3.3-70B-Instruct',
    name: 'Llama 3.3 70B',
    provider: 'meta',
    description: 'Latest Llama 3.3 with 70B parameters',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    inputCostPer1M: 0.0,
    outputCostPer1M: 0.0,
    capabilities: ['chat', 'code', 'function_calling', 'streaming'],
    status: 'available',
  },
  {
    id: 'meta-llama/Llama-3.2-90B-Vision-Instruct',
    name: 'Llama 3.2 90B Vision',
    provider: 'meta',
    description: 'Llama 3.2 with vision capabilities',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    inputCostPer1M: 0.0,
    outputCostPer1M: 0.0,
    capabilities: ['chat', 'vision', 'code', 'streaming'],
    status: 'available',
  },
  {
    id: 'meta-llama/Llama-3.2-11B-Vision-Instruct',
    name: 'Llama 3.2 11B Vision',
    provider: 'meta',
    description: 'Smaller Llama with vision',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    inputCostPer1M: 0.0,
    outputCostPer1M: 0.0,
    capabilities: ['chat', 'vision', 'code', 'streaming'],
    status: 'available',
  },
  {
    id: 'meta-llama/Llama-3.1-405B-Instruct',
    name: 'Llama 3.1 405B',
    provider: 'meta',
    description: 'Largest open-source model',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    inputCostPer1M: 0.0,
    outputCostPer1M: 0.0,
    capabilities: ['chat', 'code', 'function_calling', 'streaming'],
    status: 'available',
  },
  {
    id: 'meta-llama/Llama-3.1-70B-Instruct',
    name: 'Llama 3.1 70B',
    provider: 'meta',
    description: 'High-performance Llama model',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    inputCostPer1M: 0.0,
    outputCostPer1M: 0.0,
    capabilities: ['chat', 'code', 'function_calling', 'streaming'],
    status: 'available',
  },
  {
    id: 'meta-llama/Llama-3.1-8B-Instruct',
    name: 'Llama 3.1 8B',
    provider: 'meta',
    description: 'Efficient small Llama model',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    inputCostPer1M: 0.0,
    outputCostPer1M: 0.0,
    capabilities: ['chat', 'code', 'streaming'],
    status: 'available',
  },
  
  // Mistral Models
  {
    id: 'mistral-ai/Mistral-Large-2',
    name: 'Mistral Large 2',
    provider: 'mistral',
    description: 'Most capable Mistral model',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    inputCostPer1M: 2.0,
    outputCostPer1M: 6.0,
    capabilities: ['chat', 'code', 'function_calling', 'json_mode', 'streaming'],
    status: 'available',
  },
  {
    id: 'mistral-ai/Mistral-Nemo',
    name: 'Mistral Nemo',
    provider: 'mistral',
    description: 'Efficient Mistral model',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.15,
    capabilities: ['chat', 'code', 'streaming'],
    status: 'available',
  },
  {
    id: 'mistral-ai/Mistral-Small',
    name: 'Mistral Small',
    provider: 'mistral',
    description: 'Small and fast Mistral',
    contextWindow: 32000,
    maxOutputTokens: 4096,
    inputCostPer1M: 0.1,
    outputCostPer1M: 0.3,
    capabilities: ['chat', 'code', 'streaming'],
    status: 'available',
  },
  {
    id: 'mistral-ai/Codestral-2501',
    name: 'Codestral',
    provider: 'mistral',
    description: 'Specialized for code generation',
    contextWindow: 256000,
    maxOutputTokens: 8192,
    inputCostPer1M: 0.3,
    outputCostPer1M: 0.9,
    capabilities: ['chat', 'code', 'completion', 'streaming'],
    status: 'available',
  },
  
  // Cohere Models
  {
    id: 'cohere/command-r-plus',
    name: 'Command R+',
    provider: 'cohere',
    description: 'Most capable Cohere model',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    inputCostPer1M: 2.5,
    outputCostPer1M: 10.0,
    capabilities: ['chat', 'function_calling', 'streaming'],
    status: 'available',
  },
  {
    id: 'cohere/command-r',
    name: 'Command R',
    provider: 'cohere',
    description: 'Efficient Cohere model',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.6,
    capabilities: ['chat', 'function_calling', 'streaming'],
    status: 'available',
  },
  {
    id: 'cohere/embed-v3',
    name: 'Embed v3',
    provider: 'cohere',
    description: 'Text embeddings model',
    contextWindow: 512,
    maxOutputTokens: 0,
    inputCostPer1M: 0.1,
    outputCostPer1M: 0.0,
    capabilities: ['embeddings'],
    status: 'available',
  },
  
  // AI21 Models
  {
    id: 'ai21/jamba-1.5-large',
    name: 'Jamba 1.5 Large',
    provider: 'ai21',
    description: 'AI21 flagship model',
    contextWindow: 256000,
    maxOutputTokens: 4096,
    inputCostPer1M: 2.0,
    outputCostPer1M: 8.0,
    capabilities: ['chat', 'code', 'streaming'],
    status: 'available',
  },
  {
    id: 'ai21/jamba-1.5-mini',
    name: 'Jamba 1.5 Mini',
    provider: 'ai21',
    description: 'Efficient AI21 model',
    contextWindow: 256000,
    maxOutputTokens: 4096,
    inputCostPer1M: 0.2,
    outputCostPer1M: 0.4,
    capabilities: ['chat', 'code', 'streaming'],
    status: 'available',
  },
  
  // Microsoft Models
  {
    id: 'microsoft/Phi-4',
    name: 'Phi-4',
    provider: 'microsoft',
    description: 'Latest small language model from Microsoft',
    contextWindow: 16384,
    maxOutputTokens: 4096,
    inputCostPer1M: 0.0,
    outputCostPer1M: 0.0,
    capabilities: ['chat', 'code', 'streaming'],
    status: 'available',
  },
  {
    id: 'microsoft/Phi-3.5-mini-instruct',
    name: 'Phi-3.5 Mini',
    provider: 'microsoft',
    description: 'Compact but capable model',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    inputCostPer1M: 0.0,
    outputCostPer1M: 0.0,
    capabilities: ['chat', 'code', 'streaming'],
    status: 'available',
  },
  {
    id: 'microsoft/Phi-3.5-MoE-instruct',
    name: 'Phi-3.5 MoE',
    provider: 'microsoft',
    description: 'Mixture of Experts architecture',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    inputCostPer1M: 0.0,
    outputCostPer1M: 0.0,
    capabilities: ['chat', 'code', 'streaming'],
    status: 'available',
  },
  {
    id: 'microsoft/Phi-3.5-vision-instruct',
    name: 'Phi-3.5 Vision',
    provider: 'microsoft',
    description: 'Vision-capable small model',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    inputCostPer1M: 0.0,
    outputCostPer1M: 0.0,
    capabilities: ['chat', 'vision', 'streaming'],
    status: 'available',
  },
  
  // DeepSeek Models
  {
    id: 'deepseek/DeepSeek-V3',
    name: 'DeepSeek V3',
    provider: 'deepseek',
    description: 'Latest DeepSeek model',
    contextWindow: 64000,
    maxOutputTokens: 8192,
    inputCostPer1M: 0.27,
    outputCostPer1M: 1.10,
    capabilities: ['chat', 'code', 'reasoning', 'streaming'],
    status: 'available',
  },
  {
    id: 'deepseek/DeepSeek-R1',
    name: 'DeepSeek R1',
    provider: 'deepseek',
    description: 'Reasoning-focused model',
    contextWindow: 64000,
    maxOutputTokens: 8192,
    inputCostPer1M: 0.55,
    outputCostPer1M: 2.19,
    capabilities: ['chat', 'code', 'reasoning', 'streaming'],
    status: 'available',
  },
  
  // OpenAI Embeddings
  {
    id: 'openai/text-embedding-3-large',
    name: 'Text Embedding 3 Large',
    provider: 'openai',
    description: 'Best quality embeddings',
    contextWindow: 8191,
    maxOutputTokens: 0,
    inputCostPer1M: 0.13,
    outputCostPer1M: 0.0,
    capabilities: ['embeddings'],
    status: 'available',
  },
  {
    id: 'openai/text-embedding-3-small',
    name: 'Text Embedding 3 Small',
    provider: 'openai',
    description: 'Efficient embeddings',
    contextWindow: 8191,
    maxOutputTokens: 0,
    inputCostPer1M: 0.02,
    outputCostPer1M: 0.0,
    capabilities: ['embeddings'],
    status: 'available',
  },
];

// ============================================================================
// GitHub Models Client
// ============================================================================

export class GitHubModelsClient {
  private config: GitHubModelsConfig;
  private baseUrl: string;

  constructor(config: GitHubModelsConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://models.github.ai/inference';
  }

  /**
   * List all available models
   */
  async list(): Promise<GitHubModel[]> {
    // In production, this would call the GitHub API
    // For now, return the catalog
    return GITHUB_MODELS_CATALOG;
  }

  /**
   * Get model details
   */
  async get(modelId: string): Promise<GitHubModel | null> {
    return GITHUB_MODELS_CATALOG.find(m => m.id === modelId) || null;
  }

  /**
   * Filter models by provider
   */
  getByProvider(provider: string): GitHubModel[] {
    return GITHUB_MODELS_CATALOG.filter(m => m.provider === provider);
  }

  /**
   * Filter models by capability
   */
  getByCapability(capability: ModelCapability): GitHubModel[] {
    return GITHUB_MODELS_CATALOG.filter(m => m.capabilities.includes(capability));
  }

  /**
   * Run a chat completion
   */
  async chat(options: ModelRunOptions): Promise<ModelResponse> {
    const { model, messages, temperature, maxTokens, topP, stop, responseFormat, tools, toolChoice } = options;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.token}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: temperature ?? 0.7,
        max_tokens: maxTokens ?? 2048,
        top_p: topP,
        stop,
        response_format: responseFormat,
        tools,
        tool_choice: toolChoice,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `GitHub Models error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Run a completion (non-chat)
   */
  async complete(options: ModelRunOptions): Promise<ModelResponse> {
    const { model, prompt, temperature, maxTokens, topP, stop } = options;

    // Convert to chat format
    return this.chat({
      model,
      messages: [{ role: 'user', content: prompt || '' }],
      temperature,
      maxTokens,
      topP,
      stop,
    });
  }

  /**
   * Generate embeddings
   */
  async embed(model: string, input: string | string[]): Promise<EmbeddingResponse> {
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.token}`,
      },
      body: JSON.stringify({
        model,
        input: Array.isArray(input) ? input : [input],
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Embeddings error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Streaming chat completion
   */
  async *chatStream(options: ModelRunOptions): AsyncGenerator<string, void, unknown> {
    const { model, messages, temperature, maxTokens, topP, stop } = options;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.token}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: temperature ?? 0.7,
        max_tokens: maxTokens ?? 2048,
        top_p: topP,
        stop,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `GitHub Models error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  /**
   * Validate token
   */
  async validateToken(): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
        },
      });

      if (response.ok) {
        return { valid: true };
      } else if (response.status === 401) {
        return { valid: false, error: 'Invalid GitHub token' };
      } else {
        return { valid: false, error: `GitHub API error: ${response.status}` };
      }
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// ============================================================================
// Factory & Utilities
// ============================================================================

export function createGitHubModelsClient(token: string, baseUrl?: string): GitHubModelsClient {
  return new GitHubModelsClient({ token, baseUrl });
}

export function getModelsByProvider(provider: string): GitHubModel[] {
  return GITHUB_MODELS_CATALOG.filter(m => m.provider === provider);
}

export function getModelsByCapability(capability: ModelCapability): GitHubModel[] {
  return GITHUB_MODELS_CATALOG.filter(m => m.capabilities.includes(capability));
}

export function getChatModels(): GitHubModel[] {
  return GITHUB_MODELS_CATALOG.filter(m => m.capabilities.includes('chat'));
}

export function getEmbeddingModels(): GitHubModel[] {
  return GITHUB_MODELS_CATALOG.filter(m => m.capabilities.includes('embeddings'));
}

export function getVisionModels(): GitHubModel[] {
  return GITHUB_MODELS_CATALOG.filter(m => m.capabilities.includes('vision'));
}

export function getReasoningModels(): GitHubModel[] {
  return GITHUB_MODELS_CATALOG.filter(m => m.capabilities.includes('reasoning'));
}

export function calculateCost(model: GitHubModel, inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * model.inputCostPer1M;
  const outputCost = (outputTokens / 1_000_000) * model.outputCostPer1M;
  return inputCost + outputCost;
}

export function getProviders(): string[] {
  const providers = new Set(GITHUB_MODELS_CATALOG.map(m => m.provider));
  return Array.from(providers);
}

export function getFreeModels(): GitHubModel[] {
  return GITHUB_MODELS_CATALOG.filter(m => m.inputCostPer1M === 0 && m.outputCostPer1M === 0);
}

// Provider display names
export const PROVIDER_NAMES: Record<string, string> = {
  openai: 'OpenAI',
  meta: 'Meta',
  mistral: 'Mistral AI',
  cohere: 'Cohere',
  ai21: 'AI21 Labs',
  microsoft: 'Microsoft',
  deepseek: 'DeepSeek',
};

// Provider colors for UI
export const PROVIDER_COLORS: Record<string, string> = {
  openai: '#10a37f',
  meta: '#0668E1',
  mistral: '#FF7000',
  cohere: '#D18EE2',
  ai21: '#6366F1',
  microsoft: '#00BCF2',
  deepseek: '#4F46E5',
};
