export interface ModelCapability {
  name: string;
  supported: boolean;
}

export interface Model {
  id: string;
  name: string;
  provider: "xai" | "deepseek" | "anthropic" | "openrouter" | "huggingface" | "openai" | "nvidia";
  contextWindow: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
  modelType: "chat" | "reasoning" | "code" | "vision" | "embedding";
  capabilities: ModelCapability[];
  description: string;
  tags: string[];
  maxTokens?: number;
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
  supportsVision: boolean;
}

export const UNIFIED_MODEL_CATALOG: Model[] = [
  {
    id: "xai/grok-4-1-fast-reasoning",
    name: "Grok 4.1 Fast (Reasoning)",
    provider: "xai",
    contextWindow: 2_000_000,
    inputCostPer1M: 15.0,
    outputCostPer1M: 30.0,
    modelType: "reasoning",
    capabilities: [
      { name: "text", supported: true },
      { name: "reasoning", supported: true },
      { name: "web_search", supported: true },
      { name: "tool_calling", supported: true },
    ],
    description: "Next-gen reasoning model with 2M context and agent tools",
    tags: ["frontier", "reasoning", "web-search", "2M-context"],
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
  },
  {
    id: "xai/grok-4-1-fast-non-reasoning",
    name: "Grok 4.1 Fast",
    provider: "xai",
    contextWindow: 2_000_000,
    inputCostPer1M: 8.0,
    outputCostPer1M: 16.0,
    modelType: "chat",
    capabilities: [
      { name: "text", supported: true },
      { name: "web_search", supported: true },
    ],
    description: "Fast chat model with 2M context",
    tags: ["fast", "chat", "web-search", "2M-context"],
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
  },
  {
    id: "xai/grok-code-fast-1",
    name: "Grok Code Fast",
    provider: "xai",
    contextWindow: 2_000_000,
    inputCostPer1M: 12.0,
    outputCostPer1M: 24.0,
    modelType: "code",
    capabilities: [
      { name: "code", supported: true },
      { name: "agent", supported: true },
    ],
    description: "Code-specialized model with agent capabilities",
    tags: ["code", "agent", "fast"],
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
  },
  {
    id: "xai/grok-2-vision-latest",
    name: "Grok 2 Vision",
    provider: "xai",
    contextWindow: 32_000,
    inputCostPer1M: 10.0,
    outputCostPer1M: 20.0,
    modelType: "vision",
    capabilities: [
      { name: "text", supported: true },
      { name: "vision", supported: true },
    ],
    description: "Multimodal vision model",
    tags: ["vision", "multimodal"],
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: true,
  },
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek Chat V3.2",
    provider: "deepseek",
    contextWindow: 128_000,
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.28,
    modelType: "chat",
    capabilities: [
      { name: "text", supported: true },
      { name: "thinking", supported: true },
    ],
    description: "Flagship chat model with thinking mode",
    tags: ["chat", "thinking", "cost-effective"],
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
  },
  {
    id: "deepseek/deepseek-reasoner",
    name: "DeepSeek Reasoner",
    provider: "deepseek",
    contextWindow: 128_000,
    inputCostPer1M: 0.55,
    outputCostPer1M: 2.19,
    modelType: "reasoning",
    capabilities: [
      { name: "reasoning", supported: true },
      { name: "math", supported: true },
      { name: "code", supported: true },
    ],
    description: "Chain-of-thought reasoning specialist",
    tags: ["reasoning", "math", "code"],
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
  },
  {
    id: "anthropic/claude-opus-4-5",
    name: "Claude Opus 4.5",
    provider: "anthropic",
    contextWindow: 200_000,
    inputCostPer1M: 15.0,
    outputCostPer1M: 75.0,
    modelType: "reasoning",
    capabilities: [
      { name: "text", supported: true },
      { name: "code", supported: true },
      { name: "vision", supported: true },
    ],
    description: "World's best coding model - SWE-bench: 80.9%",
    tags: ["frontier", "coding", "vision", "best-coding"],
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
  },
  {
    id: "anthropic/claude-sonnet-4-5",
    name: "Claude Sonnet 4.5",
    provider: "anthropic",
    contextWindow: 200_000,
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    modelType: "code",
    capabilities: [
      { name: "text", supported: true },
      { name: "code", supported: true },
      { name: "vision", supported: true },
    ],
    description: "Balanced performance, best value for coding",
    tags: ["balanced", "code", "vision", "value"],
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
  },
  {
    id: "huggingface/Qwen/Qwen3-Next-80B-A3B",
    name: "Qwen3-Next 80B A3B",
    provider: "huggingface",
    contextWindow: 32_000,
    inputCostPer1M: 0.8,
    outputCostPer1M: 0.8,
    modelType: "reasoning",
    capabilities: [
      { name: "text", supported: true },
      { name: "code", supported: true },
    ],
    description: "Frontier open-source reasoning model",
    tags: ["frontier", "open-source", "qwen"],
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
  },
  {
    id: "huggingface/meta-llama/Llama-3.1-405B",
    name: "Llama 3.1 405B",
    provider: "huggingface",
    contextWindow: 128_000,
    inputCostPer1M: 2.7,
    outputCostPer1M: 2.7,
    modelType: "chat",
    capabilities: [
      { name: "text", supported: true },
      { name: "code", supported: true },
    ],
    description: "Meta's largest open model",
    tags: ["frontier", "open-source", "llama"],
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
  },
  {
    id: "openrouter/openai/gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "openrouter",
    contextWindow: 128_000,
    inputCostPer1M: 10.0,
    outputCostPer1M: 30.0,
    modelType: "reasoning",
    capabilities: [
      { name: "text", supported: true },
      { name: "code", supported: true },
      { name: "vision", supported: true },
    ],
    description: "OpenAI's flagship model via OpenRouter",
    tags: ["gpt-4", "vision", "openrouter"],
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
  },
  {
    id: "openrouter/google/gemini-2-5-pro",
    name: "Gemini 2.5 Pro",
    provider: "openrouter",
    contextWindow: 1_000_000,
    inputCostPer1M: 1.25,
    outputCostPer1M: 5.0,
    modelType: "vision",
    capabilities: [
      { name: "text", supported: true },
      { name: "code", supported: true },
      { name: "vision", supported: true },
    ],
    description: "Google's multimodal frontier model",
    tags: ["frontier", "vision", "1M-context", "gemini"],
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
  },
  {
    id: "nvidia/llama-3.2-nv-embedqa-1b-v2",
    name: "NVIDIA Embedding QA 1B",
    provider: "nvidia",
    contextWindow: 8192,
    inputCostPer1M: 0.02,
    outputCostPer1M: 0.0,
    modelType: "embedding",
    capabilities: [
      { name: "embedding", supported: true },
    ],
    description: "High-performance embedding model",
    tags: ["embedding", "nvidia", "fast"],
    supportsStreaming: false,
    supportsFunctionCalling: false,
    supportsVision: false,
  },
  {
    id: "nvidia/llama-3.2-nv-rerankqa-1b-v2",
    name: "NVIDIA Rerank QA 1B",
    provider: "nvidia",
    contextWindow: 8192,
    inputCostPer1M: 0.03,
    outputCostPer1M: 0.0,
    modelType: "chat",
    capabilities: [
      { name: "reranking", supported: true },
    ],
    description: "Document reranking model",
    tags: ["reranking", "nvidia", "rag"],
    supportsStreaming: false,
    supportsFunctionCalling: false,
    supportsVision: false,
  },
];

export const getModelsByProvider = (provider: Model["provider"]) => {
  return UNIFIED_MODEL_CATALOG.filter((m) => m.provider === provider);
};

export const getModelById = (id: string) => {
  return UNIFIED_MODEL_CATALOG.find((m) => m.id === id);
};

export const getModelsByType = (type: Model["modelType"]) => {
  return UNIFIED_MODEL_CATALOG.filter((m) => m.modelType === type);
};

export const getModelsByTag = (tag: string) => {
  return UNIFIED_MODEL_CATALOG.filter((m) => m.tags.includes(tag));
};
