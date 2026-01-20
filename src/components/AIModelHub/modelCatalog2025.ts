// 2025 AI Model Catalog - TFree-HAT 7B, Llama 3.1 70B, Qwen3 Series

import { AIModel } from './types';

export const AI_MODEL_CATALOG_2025: AIModel[] = [
  // ========================================
  // TFree-HAT 7B - Aleph Alpha
  // ========================================
  {
    id: 'aleph-alpha/tfree-hat-7b',
    name: 'TFree-HAT 7B',
    provider: 'aleph-alpha',
    providerDisplayName: 'Aleph Alpha',
    version: '1.0',
    description: 'German-optimized tokenizer-free model that outperforms Llama 3.1 8B on 67% of German benchmarks. Uses hash-based adaptive tokenization (HAT) for superior multilingual handling.',
    languageOptimization: 'german',
    supportedLanguages: ['de', 'en', 'fr', 'es', 'it'],
    languageFlag: '🇩🇪',
    contextWindow: 8192,
    parameters: '7B',
    capabilities: [
      { type: 'text', supported: true, description: 'Advanced text generation' },
      { type: 'reasoning', supported: true, description: 'Strong logical reasoning' },
      { type: 'multilingual', supported: true, description: 'German-optimized, multilingual support' },
      { type: 'code', supported: true, description: 'Basic code generation' },
    ],
    benchmarks: [
      { name: 'German Understanding', score: 78.5, benchmark: 'GermanQuAD', category: 'German NLP' },
      { name: 'German Reasoning', score: 72.3, benchmark: 'ARC-de', category: 'German Reasoning' },
      { name: 'Multilingual', score: 71.8, benchmark: 'MMLU-de', category: 'Knowledge' },
      { name: 'General', score: 68.2, benchmark: 'HellaSwag', category: 'Commonsense' },
    ],
    license: 'apache-2.0',
    deploymentOptions: [
      { method: 'api', available: true, endpoint: 'https://api.aleph-alpha.com/complete' },
      { method: 'ollama', available: true, instructions: 'ollama pull tfree-hat:7b' },
      { method: 'download', available: true, downloadUrl: 'https://huggingface.co/aleph-alpha/tfree-hat-7b' },
    ],
    inputCostPer1M: 0.8,
    outputCostPer1M: 1.2,
    releaseDate: '2025-01-15',
    tags: ['german', 'tokenizer-free', 'multilingual', 'efficient', 'european-ai'],
    featured: true,
    isNew: true,
  },
  {
    id: 'aleph-alpha/tfree-hat-7b-instruct',
    name: 'TFree-HAT 7B Instruct',
    provider: 'aleph-alpha',
    providerDisplayName: 'Aleph Alpha',
    version: '1.0',
    description: 'Instruction-tuned version of TFree-HAT 7B, optimized for German conversation and task completion.',
    languageOptimization: 'german',
    supportedLanguages: ['de', 'en', 'fr', 'es', 'it'],
    languageFlag: '🇩🇪',
    contextWindow: 8192,
    parameters: '7B',
    capabilities: [
      { type: 'text', supported: true, description: 'Instruction following' },
      { type: 'reasoning', supported: true, description: 'Task reasoning' },
      { type: 'multilingual', supported: true, description: 'German-first multilingual' },
    ],
    benchmarks: [
      { name: 'German Instructions', score: 82.1, benchmark: 'IFEval-de', category: 'Instruction Following' },
      { name: 'German Chat', score: 79.4, benchmark: 'MT-Bench-de', category: 'Conversation' },
    ],
    license: 'apache-2.0',
    deploymentOptions: [
      { method: 'api', available: true, endpoint: 'https://api.aleph-alpha.com/complete' },
      { method: 'ollama', available: true, instructions: 'ollama pull tfree-hat:7b-instruct' },
      { method: 'download', available: true, downloadUrl: 'https://huggingface.co/aleph-alpha/tfree-hat-7b-instruct' },
    ],
    inputCostPer1M: 0.8,
    outputCostPer1M: 1.2,
    releaseDate: '2025-01-15',
    tags: ['german', 'instruct', 'chat', 'european-ai'],
    isNew: true,
  },

  // ========================================
  // Meta Llama 3.1 70B
  // ========================================
  {
    id: 'meta/llama-3.1-70b',
    name: 'Llama 3.1 70B',
    provider: 'meta',
    providerDisplayName: 'Meta AI',
    version: '3.1',
    description: 'Meta\'s flagship open-source model with 128K context window. Excellent multilingual support including German and Japanese.',
    languageOptimization: 'multilingual',
    supportedLanguages: ['en', 'de', 'fr', 'es', 'it', 'pt', 'ja', 'zh', 'ko'],
    languageFlag: '🌍',
    contextWindow: 128000,
    parameters: '70B',
    capabilities: [
      { type: 'text', supported: true, description: 'State-of-the-art text generation' },
      { type: 'reasoning', supported: true, description: 'Advanced reasoning capabilities' },
      { type: 'code', supported: true, description: 'Strong code generation' },
      { type: 'multilingual', supported: true, description: '8+ languages supported' },
    ],
    benchmarks: [
      { name: 'MMLU', score: 82.0, benchmark: 'MMLU', category: 'Knowledge' },
      { name: 'HumanEval', score: 80.5, benchmark: 'HumanEval', category: 'Coding' },
      { name: 'MATH', score: 68.0, benchmark: 'MATH', category: 'Mathematics' },
      { name: 'GSM8K', score: 95.1, benchmark: 'GSM8K', category: 'Math Reasoning' },
      { name: 'German', score: 76.2, benchmark: 'MMLU-de', category: 'German' },
      { name: 'Japanese', score: 74.8, benchmark: 'JGLUE', category: 'Japanese' },
    ],
    license: 'llama-3.1',
    licenseUrl: 'https://llama.meta.com/llama3_1/license/',
    deploymentOptions: [
      { method: 'api', available: true, endpoint: 'https://api.together.xyz/v1/chat/completions' },
      { method: 'ollama', available: true, instructions: 'ollama pull llama3.1:70b' },
      { method: 'supabase-ai', available: true, instructions: 'Available via Supabase AI Toolkit' },
      { method: 'download', available: true, downloadUrl: 'https://huggingface.co/meta-llama/Llama-3.1-70B' },
    ],
    inputCostPer1M: 0.9,
    outputCostPer1M: 0.9,
    releaseDate: '2024-07-23',
    tags: ['flagship', 'multilingual', '128k-context', 'open-source'],
    featured: true,
  },
  {
    id: 'meta/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B Instruct',
    provider: 'meta',
    providerDisplayName: 'Meta AI',
    version: '3.1',
    description: 'Instruction-tuned Llama 3.1 70B optimized for following complex instructions and conversational tasks.',
    languageOptimization: 'multilingual',
    supportedLanguages: ['en', 'de', 'fr', 'es', 'it', 'pt', 'ja', 'zh', 'ko'],
    languageFlag: '🌍',
    contextWindow: 128000,
    parameters: '70B',
    capabilities: [
      { type: 'text', supported: true, description: 'Instruction following' },
      { type: 'reasoning', supported: true, description: 'Complex reasoning' },
      { type: 'code', supported: true, description: 'Code assistance' },
      { type: 'multilingual', supported: true, description: 'Multilingual chat' },
    ],
    benchmarks: [
      { name: 'IFEval', score: 87.5, benchmark: 'IFEval', category: 'Instruction Following' },
      { name: 'MT-Bench', score: 8.9, benchmark: 'MT-Bench', category: 'Conversation' },
      { name: 'AlpacaEval', score: 34.2, benchmark: 'AlpacaEval 2.0', category: 'Helpfulness' },
    ],
    license: 'llama-3.1',
    deploymentOptions: [
      { method: 'api', available: true, endpoint: 'https://api.together.xyz/v1/chat/completions' },
      { method: 'ollama', available: true, instructions: 'ollama pull llama3.1:70b-instruct' },
      { method: 'supabase-ai', available: true },
      { method: 'download', available: true, downloadUrl: 'https://huggingface.co/meta-llama/Llama-3.1-70B-Instruct' },
    ],
    inputCostPer1M: 0.9,
    outputCostPer1M: 0.9,
    releaseDate: '2024-07-23',
    tags: ['instruct', 'chat', 'multilingual', 'open-source'],
  },

  // ========================================
  // Qwen3 Series - Alibaba
  // ========================================
  {
    id: 'alibaba/qwen3-14b',
    name: 'Qwen3 14B',
    provider: 'alibaba',
    providerDisplayName: 'Alibaba Cloud',
    version: '3.0',
    description: 'Alibaba\'s multilingual powerhouse supporting 119 languages with 131K context. Excellent for global applications.',
    languageOptimization: 'multilingual',
    supportedLanguages: ['en', 'zh', 'ja', 'ko', 'de', 'fr', 'es', 'ar', 'ru', 'pt', 'it', 'vi', 'th', 'id'],
    languageFlag: '🌍',
    contextWindow: 131072,
    parameters: '14B',
    capabilities: [
      { type: 'text', supported: true, description: 'Advanced text generation' },
      { type: 'reasoning', supported: true, description: 'Strong reasoning' },
      { type: 'code', supported: true, description: 'Code generation' },
      { type: 'multilingual', supported: true, description: '119 languages' },
    ],
    benchmarks: [
      { name: 'MMLU', score: 79.8, benchmark: 'MMLU', category: 'Knowledge' },
      { name: 'HumanEval', score: 76.2, benchmark: 'HumanEval', category: 'Coding' },
      { name: 'GSM8K', score: 91.4, benchmark: 'GSM8K', category: 'Math' },
      { name: 'Japanese', score: 82.1, benchmark: 'JGLUE', category: 'Japanese' },
      { name: 'Chinese', score: 88.5, benchmark: 'C-Eval', category: 'Chinese' },
      { name: 'German', score: 75.3, benchmark: 'MMLU-de', category: 'German' },
    ],
    license: 'qwen',
    licenseUrl: 'https://github.com/QwenLM/Qwen/blob/main/LICENSE',
    deploymentOptions: [
      { method: 'api', available: true, endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation' },
      { method: 'ollama', available: true, instructions: 'ollama pull qwen3:14b' },
      { method: 'supabase-ai', available: true },
      { method: 'download', available: true, downloadUrl: 'https://huggingface.co/Qwen/Qwen3-14B' },
    ],
    inputCostPer1M: 0.5,
    outputCostPer1M: 0.5,
    freeTier: true,
    releaseDate: '2025-01-10',
    tags: ['multilingual', '119-languages', '131k-context', 'cost-effective'],
    featured: true,
    isNew: true,
  },
  {
    id: 'alibaba/qwen3-14b-instruct',
    name: 'Qwen3 14B Instruct',
    provider: 'alibaba',
    providerDisplayName: 'Alibaba Cloud',
    version: '3.0',
    description: 'Instruction-tuned Qwen3 14B optimized for chat and task completion across 119 languages.',
    languageOptimization: 'multilingual',
    supportedLanguages: ['en', 'zh', 'ja', 'ko', 'de', 'fr', 'es', 'ar', 'ru', 'pt', 'it', 'vi', 'th', 'id'],
    languageFlag: '🌍',
    contextWindow: 131072,
    parameters: '14B',
    capabilities: [
      { type: 'text', supported: true, description: 'Instruction following' },
      { type: 'reasoning', supported: true, description: 'Task reasoning' },
      { type: 'code', supported: true, description: 'Code assistance' },
      { type: 'multilingual', supported: true, description: '119 languages' },
    ],
    benchmarks: [
      { name: 'IFEval', score: 84.2, benchmark: 'IFEval', category: 'Instruction Following' },
      { name: 'MT-Bench', score: 8.6, benchmark: 'MT-Bench', category: 'Conversation' },
    ],
    license: 'qwen',
    deploymentOptions: [
      { method: 'api', available: true, endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation' },
      { method: 'ollama', available: true, instructions: 'ollama pull qwen3:14b-instruct' },
      { method: 'supabase-ai', available: true },
    ],
    inputCostPer1M: 0.5,
    outputCostPer1M: 0.5,
    freeTier: true,
    releaseDate: '2025-01-10',
    tags: ['instruct', 'chat', 'multilingual'],
    isNew: true,
  },
  {
    id: 'alibaba/qwen3-235b',
    name: 'Qwen3 235B',
    provider: 'alibaba',
    providerDisplayName: 'Alibaba Cloud',
    version: '3.0',
    description: 'Alibaba\'s largest model with 235B parameters. State-of-the-art multilingual performance rivaling GPT-4.',
    languageOptimization: 'multilingual',
    supportedLanguages: ['en', 'zh', 'ja', 'ko', 'de', 'fr', 'es', 'ar', 'ru', 'pt', 'it', 'vi', 'th', 'id'],
    languageFlag: '🌍',
    contextWindow: 131072,
    parameters: '235B',
    capabilities: [
      { type: 'text', supported: true, description: 'Frontier text generation' },
      { type: 'reasoning', supported: true, description: 'Advanced reasoning' },
      { type: 'code', supported: true, description: 'Expert code generation' },
      { type: 'multilingual', supported: true, description: '119 languages' },
      { type: 'vision', supported: true, description: 'Multimodal understanding' },
    ],
    benchmarks: [
      { name: 'MMLU', score: 88.5, benchmark: 'MMLU', category: 'Knowledge' },
      { name: 'HumanEval', score: 85.3, benchmark: 'HumanEval', category: 'Coding' },
      { name: 'MATH', score: 76.4, benchmark: 'MATH', category: 'Mathematics' },
      { name: 'GSM8K', score: 96.2, benchmark: 'GSM8K', category: 'Math' },
      { name: 'Japanese', score: 87.2, benchmark: 'JGLUE', category: 'Japanese' },
      { name: 'Chinese', score: 93.1, benchmark: 'C-Eval', category: 'Chinese' },
      { name: 'German', score: 82.7, benchmark: 'MMLU-de', category: 'German' },
    ],
    license: 'qwen',
    deploymentOptions: [
      { method: 'api', available: true, endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation' },
      { method: 'supabase-ai', available: true },
    ],
    inputCostPer1M: 2.0,
    outputCostPer1M: 4.0,
    releaseDate: '2025-01-10',
    tags: ['frontier', 'multilingual', '235b', 'flagship'],
    featured: true,
    isNew: true,
  },

  // ========================================
  // Qwen3 Japanese - Specialized
  // ========================================
  {
    id: 'alibaba/qwen3-japanese-14b',
    name: 'Qwen3 Japanese 14B',
    provider: 'alibaba',
    providerDisplayName: 'Alibaba Cloud',
    version: '3.0',
    description: 'Specialized Japanese model - open-source alternative to Rakuten AI 3.0. Optimized for Japanese NLP tasks.',
    languageOptimization: 'japanese',
    supportedLanguages: ['ja', 'en'],
    languageFlag: '🇯🇵',
    contextWindow: 131072,
    parameters: '14B',
    capabilities: [
      { type: 'text', supported: true, description: 'Japanese text generation' },
      { type: 'reasoning', supported: true, description: 'Japanese reasoning' },
      { type: 'code', supported: true, description: 'Code with Japanese comments' },
      { type: 'multilingual', supported: true, description: 'Japanese-English bilingual' },
    ],
    benchmarks: [
      { name: 'JGLUE', score: 88.4, benchmark: 'JGLUE', category: 'Japanese Understanding' },
      { name: 'JCommonsenseQA', score: 85.2, benchmark: 'JCommonsenseQA', category: 'Japanese Reasoning' },
      { name: 'JNLI', score: 86.7, benchmark: 'JNLI', category: 'Japanese NLI' },
      { name: 'Japanese MT', score: 42.5, benchmark: 'WMT-ja', category: 'Translation' },
    ],
    license: 'qwen',
    deploymentOptions: [
      { method: 'api', available: true, endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation' },
      { method: 'ollama', available: true, instructions: 'ollama pull qwen3-japanese:14b' },
      { method: 'supabase-ai', available: true },
      { method: 'download', available: true, downloadUrl: 'https://huggingface.co/Qwen/Qwen3-Japanese-14B' },
    ],
    inputCostPer1M: 0.5,
    outputCostPer1M: 0.5,
    freeTier: true,
    releaseDate: '2025-01-10',
    tags: ['japanese', 'specialized', 'bilingual', 'open-source'],
    featured: true,
    isNew: true,
  },
  {
    id: 'alibaba/qwen3-japanese-72b',
    name: 'Qwen3 Japanese 72B',
    provider: 'alibaba',
    providerDisplayName: 'Alibaba Cloud',
    version: '3.0',
    description: 'Large Japanese-specialized model with 72B parameters. Best-in-class Japanese performance.',
    languageOptimization: 'japanese',
    supportedLanguages: ['ja', 'en'],
    languageFlag: '🇯🇵',
    contextWindow: 131072,
    parameters: '72B',
    capabilities: [
      { type: 'text', supported: true, description: 'Superior Japanese generation' },
      { type: 'reasoning', supported: true, description: 'Complex Japanese reasoning' },
      { type: 'code', supported: true, description: 'Code generation' },
    ],
    benchmarks: [
      { name: 'JGLUE', score: 92.1, benchmark: 'JGLUE', category: 'Japanese Understanding' },
      { name: 'JCommonsenseQA', score: 89.8, benchmark: 'JCommonsenseQA', category: 'Japanese Reasoning' },
      { name: 'JNLI', score: 91.2, benchmark: 'JNLI', category: 'Japanese NLI' },
    ],
    license: 'qwen',
    deploymentOptions: [
      { method: 'api', available: true, endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation' },
      { method: 'supabase-ai', available: true },
    ],
    inputCostPer1M: 1.5,
    outputCostPer1M: 2.0,
    releaseDate: '2025-01-10',
    tags: ['japanese', 'large', 'flagship-japanese'],
    isNew: true,
  },

  // ========================================
  // Additional OpenRouter Models
  // ========================================
  {
    id: 'openrouter/llama-3.1-70b',
    name: 'Llama 3.1 70B (OpenRouter)',
    provider: 'openrouter',
    providerDisplayName: 'OpenRouter',
    version: '3.1',
    description: 'Llama 3.1 70B via OpenRouter with unified API access.',
    languageOptimization: 'multilingual',
    supportedLanguages: ['en', 'de', 'fr', 'es', 'it', 'pt', 'ja', 'zh', 'ko'],
    languageFlag: '🌍',
    contextWindow: 128000,
    parameters: '70B',
    capabilities: [
      { type: 'text', supported: true },
      { type: 'reasoning', supported: true },
      { type: 'code', supported: true },
      { type: 'multilingual', supported: true },
    ],
    benchmarks: [],
    license: 'llama-3.1',
    deploymentOptions: [
      { method: 'api', available: true, endpoint: 'https://openrouter.ai/api/v1/chat/completions' },
    ],
    inputCostPer1M: 0.59,
    outputCostPer1M: 0.79,
    releaseDate: '2024-07-23',
    tags: ['openrouter', 'unified-api', 'multilingual'],
  },
  {
    id: 'openrouter/qwen3-235b',
    name: 'Qwen3 235B (OpenRouter)',
    provider: 'openrouter',
    providerDisplayName: 'OpenRouter',
    version: '3.0',
    description: 'Qwen3 235B via OpenRouter API.',
    languageOptimization: 'multilingual',
    supportedLanguages: ['en', 'zh', 'ja', 'ko', 'de', 'fr', 'es'],
    languageFlag: '🌍',
    contextWindow: 131072,
    parameters: '235B',
    capabilities: [
      { type: 'text', supported: true },
      { type: 'reasoning', supported: true },
      { type: 'code', supported: true },
      { type: 'multilingual', supported: true },
    ],
    benchmarks: [],
    license: 'qwen',
    deploymentOptions: [
      { method: 'api', available: true, endpoint: 'https://openrouter.ai/api/v1/chat/completions' },
    ],
    inputCostPer1M: 1.5,
    outputCostPer1M: 3.0,
    releaseDate: '2025-01-10',
    tags: ['openrouter', 'frontier', 'multilingual'],
    isNew: true,
  },

  // ========================================
  // Hugging Face Models
  // ========================================
  {
    id: 'huggingface/tfree-hat-7b',
    name: 'TFree-HAT 7B (HF)',
    provider: 'huggingface',
    providerDisplayName: 'Hugging Face',
    version: '1.0',
    description: 'TFree-HAT 7B available on Hugging Face Hub with Inference API.',
    languageOptimization: 'german',
    supportedLanguages: ['de', 'en'],
    languageFlag: '🇩🇪',
    contextWindow: 8192,
    parameters: '7B',
    capabilities: [
      { type: 'text', supported: true },
      { type: 'multilingual', supported: true },
    ],
    benchmarks: [],
    license: 'apache-2.0',
    deploymentOptions: [
      { method: 'api', available: true, endpoint: 'https://api-inference.huggingface.co/models/aleph-alpha/tfree-hat-7b' },
      { method: 'download', available: true, downloadUrl: 'https://huggingface.co/aleph-alpha/tfree-hat-7b' },
    ],
    freeTier: true,
    releaseDate: '2025-01-15',
    tags: ['huggingface', 'german', 'free-tier'],
    isNew: true,
  },
  {
    id: 'huggingface/qwen3-14b',
    name: 'Qwen3 14B (HF)',
    provider: 'huggingface',
    providerDisplayName: 'Hugging Face',
    version: '3.0',
    description: 'Qwen3 14B available on Hugging Face with free Inference API.',
    languageOptimization: 'multilingual',
    supportedLanguages: ['en', 'zh', 'ja', 'ko', 'de'],
    languageFlag: '🌍',
    contextWindow: 131072,
    parameters: '14B',
    capabilities: [
      { type: 'text', supported: true },
      { type: 'multilingual', supported: true },
      { type: 'code', supported: true },
    ],
    benchmarks: [],
    license: 'qwen',
    deploymentOptions: [
      { method: 'api', available: true, endpoint: 'https://api-inference.huggingface.co/models/Qwen/Qwen3-14B' },
      { method: 'download', available: true, downloadUrl: 'https://huggingface.co/Qwen/Qwen3-14B' },
    ],
    freeTier: true,
    releaseDate: '2025-01-10',
    tags: ['huggingface', 'multilingual', 'free-tier'],
    isNew: true,
  },

  // ========================================
  // Supabase AI Models
  // ========================================
  {
    id: 'supabase-ai/gte-small',
    name: 'GTE Small (Embeddings)',
    provider: 'supabase-ai',
    providerDisplayName: 'Supabase AI',
    version: '1.0',
    description: 'Efficient embedding model for Supabase vector search. 384 dimensions.',
    languageOptimization: 'english',
    supportedLanguages: ['en'],
    contextWindow: 512,
    capabilities: [
      { type: 'embedding', supported: true, description: '384-dimensional embeddings' },
    ],
    benchmarks: [
      { name: 'MTEB', score: 62.5, benchmark: 'MTEB', category: 'Embedding' },
    ],
    license: 'apache-2.0',
    deploymentOptions: [
      { method: 'supabase-ai', available: true, instructions: 'Built-in Supabase AI function' },
      { method: 'edge-function', available: true },
    ],
    freeTier: true,
    tags: ['embedding', 'supabase', 'vector-search'],
  },
  {
    id: 'supabase-ai/multilingual-e5-large',
    name: 'Multilingual E5 Large',
    provider: 'supabase-ai',
    providerDisplayName: 'Supabase AI',
    version: '1.0',
    description: 'Multilingual embedding model supporting 100+ languages. 1024 dimensions.',
    languageOptimization: 'multilingual',
    supportedLanguages: ['en', 'de', 'ja', 'zh', 'fr', 'es', 'ko', 'ar', 'ru'],
    languageFlag: '🌍',
    contextWindow: 512,
    capabilities: [
      { type: 'embedding', supported: true, description: '1024-dimensional multilingual embeddings' },
      { type: 'multilingual', supported: true, description: '100+ languages' },
    ],
    benchmarks: [
      { name: 'MTEB', score: 68.4, benchmark: 'MTEB', category: 'Embedding' },
      { name: 'Multilingual', score: 72.1, benchmark: 'MIRACL', category: 'Cross-lingual' },
    ],
    license: 'apache-2.0',
    deploymentOptions: [
      { method: 'supabase-ai', available: true },
      { method: 'edge-function', available: true },
    ],
    freeTier: true,
    tags: ['embedding', 'multilingual', 'supabase'],
    featured: true,
  },

  // ========================================
  // Ollama Local Models
  // ========================================
  {
    id: 'ollama/llama3.1-70b',
    name: 'Llama 3.1 70B (Ollama)',
    provider: 'ollama',
    providerDisplayName: 'Ollama (Local)',
    version: '3.1',
    description: 'Run Llama 3.1 70B locally with Ollama. Requires 48GB+ VRAM.',
    languageOptimization: 'multilingual',
    supportedLanguages: ['en', 'de', 'ja', 'zh', 'fr', 'es'],
    languageFlag: '🌍',
    contextWindow: 128000,
    parameters: '70B',
    capabilities: [
      { type: 'text', supported: true },
      { type: 'reasoning', supported: true },
      { type: 'code', supported: true },
      { type: 'multilingual', supported: true },
    ],
    benchmarks: [],
    license: 'llama-3.1',
    deploymentOptions: [
      { method: 'ollama', available: true, instructions: 'ollama pull llama3.1:70b' },
    ],
    freeTier: true,
    tags: ['local', 'ollama', 'privacy', 'no-api'],
  },
  {
    id: 'ollama/qwen3-14b',
    name: 'Qwen3 14B (Ollama)',
    provider: 'ollama',
    providerDisplayName: 'Ollama (Local)',
    version: '3.0',
    description: 'Run Qwen3 14B locally with Ollama. Requires 16GB+ VRAM.',
    languageOptimization: 'multilingual',
    supportedLanguages: ['en', 'zh', 'ja', 'de'],
    languageFlag: '🌍',
    contextWindow: 131072,
    parameters: '14B',
    capabilities: [
      { type: 'text', supported: true },
      { type: 'multilingual', supported: true },
      { type: 'code', supported: true },
    ],
    benchmarks: [],
    license: 'qwen',
    deploymentOptions: [
      { method: 'ollama', available: true, instructions: 'ollama pull qwen3:14b' },
    ],
    freeTier: true,
    tags: ['local', 'ollama', 'privacy'],
    isNew: true,
  },
  {
    id: 'ollama/tfree-hat-7b',
    name: 'TFree-HAT 7B (Ollama)',
    provider: 'ollama',
    providerDisplayName: 'Ollama (Local)',
    version: '1.0',
    description: 'Run TFree-HAT 7B locally. German-optimized, requires 8GB+ VRAM.',
    languageOptimization: 'german',
    supportedLanguages: ['de', 'en'],
    languageFlag: '🇩🇪',
    contextWindow: 8192,
    parameters: '7B',
    capabilities: [
      { type: 'text', supported: true },
      { type: 'multilingual', supported: true },
    ],
    benchmarks: [],
    license: 'apache-2.0',
    deploymentOptions: [
      { method: 'ollama', available: true, instructions: 'ollama pull tfree-hat:7b' },
    ],
    freeTier: true,
    tags: ['local', 'german', 'efficient'],
    isNew: true,
  },
];

// Helper functions for the catalog
export class AIModelCatalog2025 {
  private models: AIModel[];

  constructor(models: AIModel[] = AI_MODEL_CATALOG_2025) {
    this.models = models;
  }

  getAllModels(): AIModel[] {
    return this.models;
  }

  getModelById(id: string): AIModel | undefined {
    return this.models.find(m => m.id === id);
  }

  searchModels(query: string): AIModel[] {
    const lowerQuery = query.toLowerCase();
    return this.models.filter(m =>
      m.name.toLowerCase().includes(lowerQuery) ||
      m.description.toLowerCase().includes(lowerQuery) ||
      m.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
      m.providerDisplayName.toLowerCase().includes(lowerQuery)
    );
  }

  filterByProvider(provider: string): AIModel[] {
    if (provider === 'all') return this.models;
    return this.models.filter(m => m.provider === provider);
  }

  filterByLanguage(language: string): AIModel[] {
    if (language === 'all') return this.models;
    return this.models.filter(m => m.languageOptimization === language);
  }

  filterByCapability(capability: string): AIModel[] {
    if (capability === 'all') return this.models;
    return this.models.filter(m => 
      m.capabilities.some(c => c.type === capability && c.supported)
    );
  }

  filterByDeployment(method: string): AIModel[] {
    if (method === 'all') return this.models;
    return this.models.filter(m =>
      m.deploymentOptions.some(d => d.method === method && d.available)
    );
  }

  getFeaturedModels(): AIModel[] {
    return this.models.filter(m => m.featured);
  }

  getNewModels(): AIModel[] {
    return this.models.filter(m => m.isNew);
  }

  getFreeModels(): AIModel[] {
    return this.models.filter(m => m.freeTier);
  }

  getGermanModels(): AIModel[] {
    return this.models.filter(m => 
      m.languageOptimization === 'german' || 
      m.supportedLanguages.includes('de')
    );
  }

  getJapaneseModels(): AIModel[] {
    return this.models.filter(m => 
      m.languageOptimization === 'japanese' || 
      m.supportedLanguages.includes('ja')
    );
  }

  getMultilingualModels(): AIModel[] {
    return this.models.filter(m => m.languageOptimization === 'multilingual');
  }

  getProviderStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const model of this.models) {
      stats[model.provider] = (stats[model.provider] || 0) + 1;
    }
    return stats;
  }

  getLanguageStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const model of this.models) {
      stats[model.languageOptimization] = (stats[model.languageOptimization] || 0) + 1;
    }
    return stats;
  }
}

export const modelCatalog2025 = new AIModelCatalog2025();
