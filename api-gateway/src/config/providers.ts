export interface Provider {
  id: string;
  name: string;
  baseUrl: string;
  models: Model[];
  capabilities: Capability[];
  requiresAuth: boolean;
  rateLimit?: {
    requests: number;
    window: number;
  };
}

export interface Model {
  id: string;
  name: string;
  contextWindow: number;
  maxTokens: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsFunctionCalling: boolean;
  inputCostPer1M?: number;
  outputCostPer1M?: number;
}

export type Capability = 
  | 'chat'
  | 'completion'
  | 'embeddings'
  | 'vision'
  | 'function-calling'
  | 'streaming'
  | 'rerank';

export const PROVIDERS: Record<string, Provider> = {
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    requiresAuth: true,
    capabilities: ['chat', 'vision', 'streaming'],
    models: [
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        contextWindow: 200000,
        maxTokens: 8192,
        supportsStreaming: true,
        supportsVision: true,
        supportsFunctionCalling: true,
        inputCostPer1M: 3.00,
        outputCostPer1M: 15.00,
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        contextWindow: 200000,
        maxTokens: 4096,
        supportsStreaming: true,
        supportsVision: true,
        supportsFunctionCalling: true,
        inputCostPer1M: 15.00,
        outputCostPer1M: 75.00,
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        contextWindow: 200000,
        maxTokens: 4096,
        supportsStreaming: true,
        supportsVision: true,
        supportsFunctionCalling: true,
        inputCostPer1M: 0.25,
        outputCostPer1M: 1.25,
      },
    ],
  },
  
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    requiresAuth: true,
    capabilities: ['chat', 'streaming'],
    models: [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        contextWindow: 64000,
        maxTokens: 8192,
        supportsStreaming: true,
        supportsVision: false,
        supportsFunctionCalling: true,
        inputCostPer1M: 0.14,
        outputCostPer1M: 0.28,
      },
      {
        id: 'deepseek-reasoner',
        name: 'DeepSeek Reasoner',
        contextWindow: 64000,
        maxTokens: 8192,
        supportsStreaming: true,
        supportsVision: false,
        supportsFunctionCalling: false,
        inputCostPer1M: 0.55,
        outputCostPer1M: 2.19,
      },
    ],
  },
  
  xai: {
    id: 'xai',
    name: 'xAI',
    baseUrl: 'https://api.x.ai/v1',
    requiresAuth: true,
    capabilities: ['chat', 'vision', 'streaming', 'function-calling'],
    models: [
      {
        id: 'grok-4-1-fast-reasoning',
        name: 'Grok 4.1 Fast Reasoning',
        contextWindow: 2000000,
        maxTokens: 32768,
        supportsStreaming: true,
        supportsVision: true,
        supportsFunctionCalling: true,
      },
      {
        id: 'grok-4-fast-reasoning',
        name: 'Grok 4 Fast Reasoning',
        contextWindow: 2000000,
        maxTokens: 32768,
        supportsStreaming: true,
        supportsVision: false,
        supportsFunctionCalling: true,
      },
      {
        id: 'grok-3-mini',
        name: 'Grok 3 Mini',
        contextWindow: 131072,
        maxTokens: 8192,
        supportsStreaming: true,
        supportsVision: false,
        supportsFunctionCalling: true,
      },
    ],
  },
  
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    requiresAuth: true,
    capabilities: ['chat', 'vision', 'streaming', 'function-calling'],
    models: [
      {
        id: 'anthropic/claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet (via OpenRouter)',
        contextWindow: 200000,
        maxTokens: 8192,
        supportsStreaming: true,
        supportsVision: true,
        supportsFunctionCalling: true,
      },
      {
        id: 'google/gemini-2.0-flash-exp:free',
        name: 'Gemini 2.0 Flash (Free)',
        contextWindow: 1000000,
        maxTokens: 8192,
        supportsStreaming: true,
        supportsVision: true,
        supportsFunctionCalling: true,
      },
      {
        id: 'meta-llama/llama-3.3-70b-instruct',
        name: 'Llama 3.3 70B Instruct',
        contextWindow: 128000,
        maxTokens: 4096,
        supportsStreaming: true,
        supportsVision: false,
        supportsFunctionCalling: true,
      },
    ],
  },
  
  nvidia_nim: {
    id: 'nvidia_nim',
    name: 'Nvidia NIM',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    requiresAuth: true,
    capabilities: ['chat', 'streaming', 'rerank'],
    models: [
      {
        id: 'nvidia/llama-3.3-70b-instruct',
        name: 'Llama 3.3 70B Instruct',
        contextWindow: 128000,
        maxTokens: 4096,
        supportsStreaming: true,
        supportsVision: false,
        supportsFunctionCalling: true,
      },
      {
        id: 'nvidia/llama-3_2-nv-rerankqa-1b-v2',
        name: 'Llama 3.2 Rerank QA 1B',
        contextWindow: 8192,
        maxTokens: 512,
        supportsStreaming: false,
        supportsVision: false,
        supportsFunctionCalling: false,
      },
    ],
  },
  
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity AI',
    baseUrl: 'https://api.perplexity.ai',
    requiresAuth: true,
    capabilities: ['chat', 'streaming'],
    models: [
      {
        id: 'sonar-pro',
        name: 'Sonar Pro',
        contextWindow: 128000,
        maxTokens: 4096,
        supportsStreaming: true,
        supportsVision: false,
        supportsFunctionCalling: false,
      },
      {
        id: 'sonar-reasoning',
        name: 'Sonar Reasoning',
        contextWindow: 128000,
        maxTokens: 4096,
        supportsStreaming: true,
        supportsVision: false,
        supportsFunctionCalling: false,
      },
    ],
  },
  
  huggingface: {
    id: 'huggingface',
    name: 'HuggingFace',
    baseUrl: 'https://api-inference.huggingface.co',
    requiresAuth: true,
    capabilities: ['chat', 'embeddings', 'streaming', 'rerank'],
    models: [
      {
        id: 'together/deepseek-ai/DeepSeek-R1',
        name: 'DeepSeek R1 (via Together)',
        contextWindow: 64000,
        maxTokens: 8192,
        supportsStreaming: true,
        supportsVision: false,
        supportsFunctionCalling: true,
      },
      {
        id: 'BAAI/bge-large-en-v1.5',
        name: 'BGE Large EN v1.5',
        contextWindow: 512,
        maxTokens: 512,
        supportsStreaming: false,
        supportsVision: false,
        supportsFunctionCalling: false,
      },
    ],
  },
};

export function getProvider(providerId: string): Provider | undefined {
  return PROVIDERS[providerId];
}

export function getProviderModel(providerId: string, modelId: string): Model | undefined {
  const provider = getProvider(providerId);
  return provider?.models.find(m => m.id === modelId);
}

export function getAllProviders(): Provider[] {
  return Object.values(PROVIDERS);
}

export function getProvidersByCapability(capability: Capability): Provider[] {
  return getAllProviders().filter(p => p.capabilities.includes(capability));
}
