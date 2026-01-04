/**
 * ModelHub Types
 * Core type definitions for the AI Integration Platform
 */

// ============================================================================
// API Key Management
// ============================================================================

export type AIProvider = 
  | 'openrouter' 
  | 'openai' 
  | 'anthropic' 
  | 'deepseek' 
  | 'xai' 
  | 'google';

export interface APIKeyConfig {
  provider: AIProvider;
  keyValue: string;
  status: 'valid' | 'invalid' | 'unchecked' | 'checking';
  lastValidated?: string;
  nickname?: string;
}

export interface APIKeyStore {
  keys: Record<AIProvider, APIKeyConfig | null>;
  defaultProvider?: AIProvider;
}

// ============================================================================
// Model Definitions
// ============================================================================

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  contextWindow: number;
  inputCostPer1M: number;  // USD per 1M input tokens
  outputCostPer1M: number; // USD per 1M output tokens
  capabilities: ModelCapability[];
  maxOutputTokens?: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  releaseDate?: string;
}

export type ModelCapability = 
  | 'chat' 
  | 'completion' 
  | 'code' 
  | 'reasoning' 
  | 'vision' 
  | 'function_calling'
  | 'json_mode';

// ============================================================================
// Prompts & Templates
// ============================================================================

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  systemPrompt?: string;
  userPromptTemplate: string;
  variables: TemplateVariable[];
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TemplateCategory = 
  | 'code_review' 
  | 'summarization' 
  | 'data_analysis' 
  | 'creative_writing'
  | 'translation'
  | 'extraction'
  | 'custom';

export interface TemplateVariable {
  name: string;
  description: string;
  defaultValue?: string;
  required: boolean;
}

export interface SavedPrompt {
  id: string;
  text: string;
  tags: string[];
  createdAt: string;
  isFavorite: boolean;
  usageCount: number;
}

// ============================================================================
// Model Responses
// ============================================================================

export interface ModelResponse {
  id: string;
  model: string;
  provider: AIProvider;
  prompt: string;
  systemPrompt?: string;
  response: string;
  tokens: TokenUsage;
  latencyMs: number;
  timestamp: string;
  status: 'success' | 'error' | 'streaming';
  error?: string;
  cost: number;
}

export interface TokenUsage {
  input: number;
  output: number;
  total: number;
}

// ============================================================================
// Batch Testing
// ============================================================================

export interface BatchTestConfig {
  id: string;
  prompt: string;
  systemPrompt?: string;
  models: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
}

export interface BatchTestResult {
  configId: string;
  responses: ModelResponse[];
  totalCost: number;
  totalLatencyMs: number;
  completedAt: string;
}

// ============================================================================
// Cost Tracking
// ============================================================================

export interface CostEntry {
  id: string;
  model: string;
  provider: AIProvider;
  tokens: TokenUsage;
  cost: number;
  timestamp: string;
}

export interface SessionCosts {
  entries: CostEntry[];
  totalCost: number;
  totalTokens: number;
  byProvider: Record<AIProvider, number>;
  byModel: Record<string, number>;
  sessionStart: string;
}

// ============================================================================
// RAG Pipeline
// ============================================================================

export interface RAGDocument {
  id: string;
  url: string;
  content: string;
  chunks: DocumentChunk[];
  metadata: {
    title?: string;
    scrapedAt: string;
    provider: string;
  };
}

export interface DocumentChunk {
  id: string;
  content: string;
  embedding?: number[];
  startIndex: number;
  endIndex: number;
}

export interface RAGQuery {
  question: string;
  documentId: string;
  model: string;
  topK: number;
}

export interface RAGResult {
  question: string;
  answer: string;
  sourceChunks: DocumentChunk[];
  model: string;
  tokens: TokenUsage;
  latencyMs: number;
  cost: number;
}

// ============================================================================
// Export Formats
// ============================================================================

export interface ExportConfig {
  format: 'markdown' | 'pdf' | 'json' | 'csv';
  includePrompt: boolean;
  includeMetadata: boolean;
  includeTimestamps: boolean;
  includeCosts: boolean;
}

export interface ComparisonExport {
  title: string;
  prompt: string;
  systemPrompt?: string;
  responses: ModelResponse[];
  totalCost: number;
  exportedAt: string;
  config: ExportConfig;
}
