// AI Model Hub Types - 2025 Models with Supabase AI Integration

export type ProviderType = 
  | 'huggingface' 
  | 'ollama' 
  | 'supabase-ai' 
  | 'openrouter' 
  | 'together-ai'
  | 'aleph-alpha'
  | 'meta'
  | 'alibaba'
  | 'rakuten';

export type LanguageOptimization = 'english' | 'german' | 'japanese' | 'multilingual';

export type ModelCapabilityType = 'text' | 'reasoning' | 'code' | 'multilingual' | 'vision' | 'embedding';

export type LicenseType = 'apache-2.0' | 'llama-3.1' | 'qwen' | 'proprietary' | 'open-source' | 'cc-by-nc-4.0';

export type DeploymentMethod = 'api' | 'ollama' | 'download' | 'supabase-ai' | 'edge-function';

export interface BenchmarkScore {
  name: string;
  score: number;
  benchmark: string;
  category?: string;
}

export interface ModelCapability {
  type: ModelCapabilityType;
  supported: boolean;
  description?: string;
}

export interface DeploymentOption {
  method: DeploymentMethod;
  available: boolean;
  endpoint?: string;
  downloadUrl?: string;
  instructions?: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: ProviderType;
  providerDisplayName: string;
  version?: string;
  description: string;
  
  // Language support
  languageOptimization: LanguageOptimization;
  supportedLanguages: string[];
  languageFlag?: string; // Emoji flag
  
  // Technical specs
  contextWindow: number;
  parameters?: string; // e.g., "7B", "70B", "235B"
  quantization?: string; // e.g., "Q4_K_M", "FP16"
  
  // Capabilities
  capabilities: ModelCapability[];
  
  // Benchmarks
  benchmarks: BenchmarkScore[];
  
  // License
  license: LicenseType;
  licenseUrl?: string;
  
  // Deployment
  deploymentOptions: DeploymentOption[];
  
  // Pricing (per 1M tokens)
  inputCostPer1M?: number;
  outputCostPer1M?: number;
  freeTier?: boolean;
  
  // Metadata
  releaseDate?: string;
  lastUpdated?: string;
  tags: string[];
  featured?: boolean;
  isNew?: boolean;
}

export interface ModelFilter {
  search: string;
  provider: ProviderType | 'all';
  language: LanguageOptimization | 'all';
  capability: ModelCapabilityType | 'all';
  license: LicenseType | 'all';
  deployment: DeploymentMethod | 'all';
  showFreeOnly: boolean;
  showNewOnly: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  citations?: RAGCitation[];
}

export interface RAGCitation {
  id: string;
  content: string;
  source: string;
  similarity: number;
  metadata?: Record<string, any>;
}

export interface RAGSearchResult {
  documents: RAGCitation[];
  query: string;
  embeddingModel: string;
  searchType: 'vector' | 'hybrid' | 'fulltext';
  processingTime: number;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

export interface EmbeddingConfig {
  provider: 'supabase-ai' | 'openai' | 'huggingface';
  model: string;
  dimensions: number;
}

export const LANGUAGE_FLAGS: Record<LanguageOptimization, string> = {
  english: '🇬🇧',
  german: '🇩🇪',
  japanese: '🇯🇵',
  multilingual: '🌍',
};

export const PROVIDER_COLORS: Record<ProviderType, string> = {
  'huggingface': 'bg-yellow-500',
  'ollama': 'bg-gray-700',
  'supabase-ai': 'bg-emerald-500',
  'openrouter': 'bg-purple-500',
  'together-ai': 'bg-blue-500',
  'aleph-alpha': 'bg-indigo-600',
  'meta': 'bg-blue-600',
  'alibaba': 'bg-orange-500',
  'rakuten': 'bg-red-500',
};

export const CAPABILITY_COLORS: Record<ModelCapabilityType, string> = {
  text: 'bg-blue-500',
  reasoning: 'bg-purple-500',
  code: 'bg-green-500',
  multilingual: 'bg-amber-500',
  vision: 'bg-pink-500',
  embedding: 'bg-cyan-500',
};
