export type ProviderType = 'xai' | 'deepseek' | 'anthropic' | 'openrouter' | 'huggingface' | 'openai' | 'google' | 'nvidia' | 'cohere' | 'perplexity' | 'venice' | 'deepinfra';
export type ModelType = 'chat' | 'reasoning' | 'code' | 'vision' | 'embedding' | 'audio' | 'image-gen';
export type PrivacyPolicy = 'zero-logging' | 'standard' | 'data-retention';

export interface ModelCapability {
  name: string;
  supported: boolean;
}

export interface UnifiedModel {
  id: string;
  name: string;
  provider: ProviderType;
  sourceId: string;
  contextWindow: number;
  modelType: ModelType;
  capabilities: ModelCapability[];
  inputCostPer1M?: number;
  outputCostPer1M?: number;
  maxTokens?: number;
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
  supportsVision: boolean;
  requiresApiKey: boolean;
  endpoint?: string;
  description?: string;
  benchmarkScores?: Record<string, number>;
  tags: string[];
  privacy?: PrivacyPolicy;
  freeTier?: boolean;
}

export const UNIFIED_MODEL_CATALOG: UnifiedModel[] = [
  // ========================================
  // xAI DIRECT MODELS
  // ========================================
  {
    id: 'xai/grok-4-1-fast-reasoning',
    name: 'Grok 4.1 Fast (Reasoning)',
    provider: 'xai',
    sourceId: 'grok-4-1-fast-reasoning',
    contextWindow: 2_000_000,
    modelType: 'reasoning',
    capabilities: [
      { name: 'text', supported: true },
      { name: 'web_search', supported: true },
      { name: 'tool_calling', supported: true },
      { name: 'reasoning', supported: true },
    ],
    inputCostPer1M: 15.0,
    outputCostPer1M: 30.0,
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    requiresApiKey: true,
    endpoint: 'https://api.x.ai/v1/chat/completions',
    description: 'Next-gen reasoning model with 2M context and agent tools',
    benchmarkScores: { reasoning: 92.5, coding: 88.3 },
    tags: ['frontier', 'reasoning', 'web-search', '2M-context'],
  },
  {
    id: 'xai/grok-4-1-fast-non-reasoning',
    name: 'Grok 4.1 Fast',
    provider: 'xai',
    sourceId: 'grok-4-1-fast-non-reasoning',
    contextWindow: 2_000_000,
    modelType: 'chat',
    capabilities: [
      { name: 'text', supported: true },
      { name: 'web_search', supported: true },
    ],
    inputCostPer1M: 8.0,
    outputCostPer1M: 16.0,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
    requiresApiKey: true,
    endpoint: 'https://api.x.ai/v1/chat/completions',
    tags: ['fast', 'chat', 'web-search', '2M-context'],
  },
  {
    id: 'xai/grok-code-fast-1',
    name: 'Grok Code Fast',
    provider: 'xai',
    sourceId: 'grok-code-fast-1',
    contextWindow: 2_000_000,
    modelType: 'code',
    capabilities: [
      { name: 'code', supported: true },
      { name: 'agent', supported: true },
    ],
    inputCostPer1M: 12.0,
    outputCostPer1M: 24.0,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    requiresApiKey: true,
    endpoint: 'https://api.x.ai/v1/chat/completions',
    tags: ['code', 'agent', 'fast'],
  },
  {
    id: 'xai/grok-2-vision-latest',
    name: 'Grok 2 Vision',
    provider: 'xai',
    sourceId: 'grok-2-vision-latest',
    contextWindow: 2_000_000,
    modelType: 'vision',
    capabilities: [
      { name: 'text', supported: true },
      { name: 'vision', supported: true },
    ],
    inputCostPer1M: 10.0,
    outputCostPer1M: 20.0,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: true,
    requiresApiKey: true,
    endpoint: 'https://api.x.ai/v1/chat/completions',
    tags: ['vision', 'multimodal', '2M-context'],
  },

  // ========================================
  // DEEPSEEK MODELS
  // ========================================
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek Chat V3.2',
    provider: 'deepseek',
    sourceId: 'deepseek-chat',
    contextWindow: 128_000,
    modelType: 'chat',
    capabilities: [
      { name: 'text', supported: true },
      { name: 'thinking', supported: true },
    ],
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.28,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
    requiresApiKey: true,
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    description: 'Flagship chat model with thinking mode',
    tags: ['chat', 'thinking', 'cost-effective'],
  },
  {
    id: 'deepseek/deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    provider: 'deepseek',
    sourceId: 'deepseek-reasoner',
    contextWindow: 128_000,
    modelType: 'reasoning',
    capabilities: [
      { name: 'reasoning', supported: true },
      { name: 'math', supported: true },
      { name: 'code', supported: true },
    ],
    inputCostPer1M: 0.55,
    outputCostPer1M: 2.19,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
    requiresApiKey: true,
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    description: 'Chain-of-thought reasoning specialist',
    benchmarkScores: { math: 91.2, coding: 89.5 },
    tags: ['reasoning', 'math', 'code'],
  },
  {
    id: 'deepseek/deepseek-coder',
    name: 'DeepSeek Coder V3.2',
    provider: 'deepseek',
    sourceId: 'deepseek-coder',
    contextWindow: 128_000,
    modelType: 'code',
    capabilities: [
      { name: 'code', supported: true },
      { name: 'debugging', supported: true },
    ],
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.28,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
    requiresApiKey: true,
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    tags: ['code', 'debugging', 'cost-effective'],
  },

  // ========================================
  // ANTHROPIC MODELS
  // ========================================
  {
    id: 'anthropic/claude-opus-4-5',
    name: 'Claude Opus 4.5',
    provider: 'anthropic',
    sourceId: 'claude-opus-4-5',
    contextWindow: 200_000,
    modelType: 'reasoning',
    capabilities: [
      { name: 'text', supported: true },
      { name: 'code', supported: true },
      { name: 'vision', supported: true },
    ],
    inputCostPer1M: 15.0,
    outputCostPer1M: 75.0,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: true,
    requiresApiKey: true,
    endpoint: 'https://api.anthropic.com/v1/messages',
    description: "World's best coding model - SWE-bench: 80.9%",
    benchmarkScores: { 'swe-bench': 80.9, coding: 95.2 },
    tags: ['frontier', 'coding', 'vision', 'best-coding'],
  },
  {
    id: 'anthropic/claude-sonnet-4-5',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    sourceId: 'claude-sonnet-4-5',
    contextWindow: 200_000,
    modelType: 'code',
    capabilities: [
      { name: 'text', supported: true },
      { name: 'code', supported: true },
      { name: 'vision', supported: true },
    ],
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: true,
    requiresApiKey: true,
    endpoint: 'https://api.anthropic.com/v1/messages',
    description: 'Balanced performance, best value for coding',
    benchmarkScores: { coding: 92.1 },
    tags: ['balanced', 'code', 'vision', 'value'],
  },
  {
    id: 'anthropic/claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    provider: 'anthropic',
    sourceId: 'claude-haiku-4-5',
    contextWindow: 200_000,
    modelType: 'chat',
    capabilities: [
      { name: 'text', supported: true },
      { name: 'code', supported: true },
    ],
    inputCostPer1M: 0.8,
    outputCostPer1M: 4.0,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
    requiresApiKey: true,
    endpoint: 'https://api.anthropic.com/v1/messages',
    description: 'Fast, cost-effective for simple tasks',
    tags: ['fast', 'chat', 'cost-effective'],
  },

  // ========================================
  // HUGGING FACE MODELS (via Inference API)
  // ========================================
  {
    id: 'huggingface/Qwen/Qwen3-Next-80B-A3B',
    name: 'Qwen3-Next 80B A3B',
    provider: 'huggingface',
    sourceId: 'Qwen/Qwen3-Next-80B-A3B-Instruct',
    contextWindow: 32_000,
    modelType: 'reasoning',
    capabilities: [
      { name: 'text', supported: true },
      { name: 'code', supported: true },
    ],
    inputCostPer1M: 0.8,
    outputCostPer1M: 0.8,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
    requiresApiKey: true,
    endpoint: 'https://api-inference.huggingface.co/models/Qwen/Qwen3-Next-80B-A3B-Instruct',
    tags: ['frontier', 'open-source', 'qwen'],
  },
  {
    id: 'huggingface/meta-llama/Llama-3.1-405B',
    name: 'Llama 3.1 405B',
    provider: 'huggingface',
    sourceId: 'meta-llama/Llama-3.1-405B-Instruct',
    contextWindow: 128_000,
    modelType: 'chat',
    capabilities: [
      { name: 'text', supported: true },
      { name: 'code', supported: true },
    ],
    inputCostPer1M: 2.7,
    outputCostPer1M: 2.7,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
    requiresApiKey: true,
    endpoint: 'https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-405B-Instruct',
    tags: ['frontier', 'open-source', 'llama'],
  },
  {
    id: 'huggingface/mistralai/Mistral-Large-2',
    name: 'Mistral Large 2',
    provider: 'huggingface',
    sourceId: 'mistralai/Mistral-Large-2',
    contextWindow: 128_000,
    modelType: 'reasoning',
    capabilities: [
      { name: 'text', supported: true },
      { name: 'code', supported: true },
    ],
    inputCostPer1M: 4.0,
    outputCostPer1M: 4.0,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
    requiresApiKey: true,
    endpoint: 'https://api-inference.huggingface.co/models/mistralai/Mistral-Large-2',
    tags: ['frontier', 'mistral', 'code'],
  },

  // ========================================
  // OPENROUTER MODELS (Sample from 400+)
  // ========================================
  {
    id: 'openrouter/openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openrouter',
    sourceId: 'openai/gpt-4-turbo',
    contextWindow: 128_000,
    modelType: 'reasoning',
    capabilities: [
      { name: 'text', supported: true },
      { name: 'code', supported: true },
      { name: 'vision', supported: true },
    ],
    inputCostPer1M: 10.0,
    outputCostPer1M: 30.0,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: true,
    requiresApiKey: true,
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    tags: ['gpt-4', 'vision', 'openrouter'],
  },
  {
    id: 'openrouter/google/gemini-2-5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'openrouter',
    sourceId: 'google/gemini-2-5-pro',
    contextWindow: 1_000_000,
    modelType: 'vision',
    capabilities: [
      { name: 'text', supported: true },
      { name: 'code', supported: true },
      { name: 'vision', supported: true },
    ],
    inputCostPer1M: 1.25,
    outputCostPer1M: 5.0,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: true,
    requiresApiKey: true,
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    tags: ['frontier', 'vision', '1M-context', 'gemini'],
  },

  // ========================================
  // EMBEDDING MODELS
  // ========================================
  {
    id: 'openai/text-embedding-3-large',
    name: 'OpenAI Embeddings Large',
    provider: 'openai',
    sourceId: 'text-embedding-3-large',
    contextWindow: 8191,
    modelType: 'embedding',
    capabilities: [{ name: 'embedding', supported: true }],
    inputCostPer1M: 0.13,
    outputCostPer1M: 0.0,
    maxTokens: 8191,
    supportsStreaming: false,
    supportsFunctionCalling: false,
    supportsVision: false,
    requiresApiKey: true,
    endpoint: 'https://api.openai.com/v1/embeddings',
    tags: ['embedding', '3072-dim', 'high-precision'],
  },
  {
    id: 'huggingface/BAAI/bge-large-en-v1.5',
    name: 'BGE Large v1.5',
    provider: 'huggingface',
    sourceId: 'BAAI/bge-large-en-v1.5',
    contextWindow: 512,
    modelType: 'embedding',
    capabilities: [{ name: 'embedding', supported: true }],
    inputCostPer1M: 0.0,
    maxTokens: 512,
    supportsStreaming: false,
    supportsFunctionCalling: false,
    supportsVision: false,
    requiresApiKey: true,
    endpoint: 'https://api-inference.huggingface.co/models/BAAI/bge-large-en-v1.5',
    tags: ['embedding', '1024-dim', 'open-source', 'free'],
  },
  {
    id: 'nvidia/llama-3.2-nv-embedqa-1b-v2',
    name: 'NVIDIA Embed QA',
    provider: 'nvidia',
    sourceId: 'nvidia/llama-3.2-nv-embedqa-1b-v2',
    contextWindow: 8192,
    modelType: 'embedding',
    capabilities: [{ name: 'embedding', supported: true }],
    inputCostPer1M: 0.02,
    supportsStreaming: false,
    supportsFunctionCalling: false,
    supportsVision: false,
    requiresApiKey: true,
    endpoint: 'https://integrate.api.nvidia.com/v1/embeddings',
    tags: ['embedding', 'nvidia', 'fast'],
  },

  // ========================================
  // UNCENSORED MODELS - VENICE AI
  // ========================================
  {
    id: 'venice/venice-uncensored',
    name: 'Venice Uncensored 1.1',
    provider: 'venice',
    sourceId: 'venice-uncensored',
    contextWindow: 32_000,
    modelType: 'chat',
    capabilities: [
      { name: 'text', supported: true },
      { name: 'code', supported: true },
      { name: 'uncensored', supported: true },
    ],
    inputCostPer1M: 0.5,
    outputCostPer1M: 0.5,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
    requiresApiKey: true,
    endpoint: 'https://api.venice.ai/api/v1/chat/completions',
    description: 'Venice Uncensored - Zero data retention, private AI',
    tags: ['uncensored', 'venice', 'private', 'zero-logging'],
    privacy: 'zero-logging',
  },

  // ========================================
  // UNCENSORED - OPENROUTER FREE MODELS
  // ========================================
  {
    id: 'openrouter/cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
    name: 'Dolphin Mistral 24B (FREE)',
    provider: 'openrouter',
    sourceId: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
    contextWindow: 32_000,
    modelType: 'chat',
    capabilities: [
      { name: 'text', supported: true },
      { name: 'code', supported: true },
      { name: 'uncensored', supported: true },
    ],
    inputCostPer1M: 0.0,
    outputCostPer1M: 0.0,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
    requiresApiKey: true,
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    description: 'Free uncensored Dolphin model via OpenRouter',
    tags: ['uncensored', 'dolphin', 'free', 'mistral', 'venice'],
    freeTier: true,
  },
  {
    id: 'openrouter/cognitivecomputations/dolphin3.0-r1-mistral-24b:free',
    name: 'Dolphin 3.0 R1 (FREE)',
    provider: 'openrouter',
    sourceId: 'cognitivecomputations/dolphin3.0-r1-mistral-24b:free',
    contextWindow: 32_000,
    modelType: 'reasoning',
    capabilities: [
      { name: 'text', supported: true },
      { name: 'code', supported: true },
      { name: 'reasoning', supported: true },
      { name: 'uncensored', supported: true },
    ],
    inputCostPer1M: 0.0,
    outputCostPer1M: 0.0,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
    requiresApiKey: true,
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    description: 'Dolphin 3.0 R1 with 800k reasoning traces - Free tier',
    tags: ['uncensored', 'dolphin', 'free', 'reasoning', 'R1'],
    freeTier: true,
  },

  // ========================================
  // UNCENSORED - DEEPINFRA
  // ========================================
  {
    id: 'deepinfra/cognitivecomputations/dolphin-2.6-mixtral-8x7b',
    name: 'Dolphin 2.6 Mixtral 8x7B',
    provider: 'deepinfra',
    sourceId: 'cognitivecomputations/dolphin-2.6-mixtral-8x7b',
    contextWindow: 32_000,
    modelType: 'chat',
    capabilities: [
      { name: 'text', supported: true },
      { name: 'code', supported: true },
      { name: 'uncensored', supported: true },
    ],
    inputCostPer1M: 0.2,
    outputCostPer1M: 0.2,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
    requiresApiKey: true,
    endpoint: 'https://api.deepinfra.com/v1/openai/chat/completions',
    description: 'Uncensored Mixtral MoE model - fast and obedient',
    tags: ['uncensored', 'dolphin', 'mixtral', 'MoE', 'code'],
    privacy: 'zero-logging',
  },

  // ========================================
  // UNCENSORED - HUGGING FACE HERMES SERIES
  // ========================================
  {
    id: 'huggingface/NousResearch/Hermes-4.3-36B',
    name: 'Hermes 4.3 36B',
    provider: 'huggingface',
    sourceId: 'NousResearch/Hermes-4.3-36B',
    contextWindow: 512_000,
    modelType: 'reasoning',
    capabilities: [
      { name: 'text', supported: true },
      { name: 'code', supported: true },
      { name: 'uncensored', supported: true },
      { name: 'function_calling', supported: true },
    ],
    inputCostPer1M: 0.4,
    outputCostPer1M: 0.4,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    requiresApiKey: true,
    endpoint: 'https://api-inference.huggingface.co/models/NousResearch/Hermes-4.3-36B',
    description: 'Hermes 4.3 - 512K context, frontier reasoning, uncensored',
    tags: ['uncensored', 'hermes', 'nousresearch', '512K-context', 'frontier'],
  },
  {
    id: 'huggingface/NousResearch/Hermes-3-Llama-3.1-405B',
    name: 'Hermes 3 405B',
    provider: 'huggingface',
    sourceId: 'NousResearch/Hermes-3-Llama-3.1-405B',
    contextWindow: 128_000,
    modelType: 'reasoning',
    capabilities: [
      { name: 'text', supported: true },
      { name: 'code', supported: true },
      { name: 'uncensored', supported: true },
      { name: 'agent', supported: true },
    ],
    inputCostPer1M: 2.7,
    outputCostPer1M: 2.7,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
    requiresApiKey: true,
    endpoint: 'https://api-inference.huggingface.co/models/NousResearch/Hermes-3-Llama-3.1-405B',
    description: 'Hermes 3 flagship - 405B frontier model, uncensored',
    tags: ['uncensored', 'hermes', 'nousresearch', '405B', 'frontier'],
  },
  {
    id: 'huggingface/dphn/Dolphin3.0-Llama3.1-8B',
    name: 'Dolphin 3.0 Llama 3.1 8B',
    provider: 'huggingface',
    sourceId: 'dphn/Dolphin3.0-Llama3.1-8B',
    contextWindow: 32_000,
    modelType: 'chat',
    capabilities: [
      { name: 'text', supported: true },
      { name: 'code', supported: true },
      { name: 'uncensored', supported: true },
    ],
    inputCostPer1M: 0.05,
    outputCostPer1M: 0.05,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
    requiresApiKey: true,
    endpoint: 'https://api-inference.huggingface.co/models/dphn/Dolphin3.0-Llama3.1-8B',
    description: 'Dolphin 3.0 - Ultimate general-purpose local model, uncensored',
    tags: ['uncensored', 'dolphin', 'llama', '8B', 'value'],
  },
  {
    id: 'huggingface/NousResearch/Hermes-3-Llama-3.1-70B',
    name: 'Hermes 3 70B',
    provider: 'huggingface',
    sourceId: 'NousResearch/Hermes-3-Llama-3.1-70B',
    contextWindow: 128_000,
    modelType: 'reasoning',
    capabilities: [
      { name: 'text', supported: true },
      { name: 'code', supported: true },
      { name: 'uncensored', supported: true },
      { name: 'agent', supported: true },
    ],
    inputCostPer1M: 1.0,
    outputCostPer1M: 1.0,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
    requiresApiKey: true,
    endpoint: 'https://api-inference.huggingface.co/models/NousResearch/Hermes-3-Llama-3.1-70B',
    description: 'Hermes 3 70B - Balanced frontier model, uncensored',
    tags: ['uncensored', 'hermes', 'nousresearch', '70B', 'frontier'],
  },
  {
    id: 'huggingface/NousResearch/Hermes-3-Llama-3.1-8B',
    name: 'Hermes 3 8B',
    provider: 'huggingface',
    sourceId: 'NousResearch/Hermes-3-Llama-3.1-8B',
    contextWindow: 128_000,
    modelType: 'chat',
    capabilities: [
      { name: 'text', supported: true },
      { name: 'code', supported: true },
      { name: 'uncensored', supported: true },
    ],
    inputCostPer1M: 0.05,
    outputCostPer1M: 0.05,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
    requiresApiKey: true,
    endpoint: 'https://api-inference.huggingface.co/models/NousResearch/Hermes-3-Llama-3.1-8B',
    description: 'Hermes 3 8B - Fast and affordable, uncensored',
    tags: ['uncensored', 'hermes', 'nousresearch', '8B', 'value'],
  },
];

export const PROVIDER_COLORS: Record<ProviderType, string> = {
  xai: 'bg-black text-white',
  deepseek: 'bg-blue-600 text-white',
  anthropic: 'bg-orange-500 text-white',
  huggingface: 'bg-yellow-500 text-black',
  openrouter: 'bg-purple-600 text-white',
  openai: 'bg-green-600 text-white',
  google: 'bg-blue-500 text-white',
  nvidia: 'bg-green-500 text-white',
  cohere: 'bg-indigo-600 text-white',
  perplexity: 'bg-teal-600 text-white',
  venice: 'bg-indigo-700 text-white',
  deepinfra: 'bg-teal-700 text-white',
};

export class ModelCatalog {
  private catalog: UnifiedModel[];
  private byId: Map<string, UnifiedModel>;
  private byProvider: Map<ProviderType, UnifiedModel[]>;
  private byType: Map<ModelType, UnifiedModel[]>;

  constructor() {
    this.catalog = UNIFIED_MODEL_CATALOG;
    this.byId = new Map();
    this.byProvider = new Map();
    this.byType = new Map();
    this._buildIndexes();
  }

  private _buildIndexes() {
    for (const model of this.catalog) {
      this.byId.set(model.id, model);

      if (!this.byProvider.has(model.provider)) {
        this.byProvider.set(model.provider, []);
      }
      this.byProvider.get(model.provider)!.push(model);

      if (!this.byType.has(model.modelType)) {
        this.byType.set(model.modelType, []);
      }
      this.byType.get(model.modelType)!.push(model);
    }
  }

  getAllModels(): UnifiedModel[] {
    return this.catalog;
  }

  getByProvider(provider: ProviderType): UnifiedModel[] {
    return this.byProvider.get(provider) || [];
  }

  getByType(modelType: ModelType): UnifiedModel[] {
    return this.byType.get(modelType) || [];
  }

  getByTags(tags: string[]): UnifiedModel[] {
    return this.catalog.filter((m) => tags.some((tag) => m.tags.includes(tag)));
  }

  search(query: string): UnifiedModel[] {
    const q = query.toLowerCase();
    return this.catalog.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  getModel(modelId: string): UnifiedModel | undefined {
    return this.byId.get(modelId);
  }

  getProviderStats() {
    const stats: Record<string, number> = {};
    for (const [provider, models] of this.byProvider) {
      stats[provider] = models.length;
    }
    return stats;
  }

  getAllTags(): string[] {
    const tags = new Set<string>();
    for (const model of this.catalog) {
      for (const tag of model.tags) {
        tags.add(tag);
      }
    }
    return Array.from(tags).sort();
  }
}

export const catalogInstance = new ModelCatalog();
