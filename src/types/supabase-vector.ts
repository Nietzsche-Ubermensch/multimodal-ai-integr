/**
 * Supabase Vector Storage Types
 * Type definitions for pgvector integration and RAG pipeline operations
 */

// =============================================================================
// Database Schema Types
// =============================================================================

/**
 * Vector dimension configurations for different embedding models
 */
export type VectorDimension = 1024 | 1536 | 3072;

/**
 * Supported embedding models with their configurations
 */
export type EmbeddingModel =
  | 'together/baai/bge-large-en-v1.5'    // 1024d - Recommended
  | 'openai/text-embedding-3-small'       // 1536d
  | 'openai/text-embedding-3-large'       // 3072d
  | 'huggingface/bge-large-en-v1.5';      // 1024d - Free

/**
 * Embedding model configuration
 */
export interface EmbeddingModelConfig {
  id: EmbeddingModel;
  name: string;
  provider: 'openrouter' | 'openai' | 'huggingface';
  dimensions: VectorDimension;
  costPer1MTokens: number;
  maxInputTokens: number;
}

/**
 * RAG vector record as stored in Supabase
 */
export interface RAGVector {
  id: string;
  content: string;
  embedding: number[];
  embedding_model: EmbeddingModel;
  metadata: RAGVectorMetadata;
  created_at: string;
}

/**
 * Metadata structure for RAG vectors
 */
export interface RAGVectorMetadata {
  source?: string;
  source_url?: string;
  timestamp?: string;
  user_id?: string;
  parent_doc_id?: string;
  chunk_index?: number;
  tags?: string[];
  [key: string]: unknown;
}

// =============================================================================
// Vector Search Types
// =============================================================================

/**
 * Parameters for vector similarity search
 */
export interface VectorSearchParams {
  /** Query embedding vector */
  queryEmbedding: number[];
  /** Minimum similarity threshold (0-1, default: 0.7) */
  matchThreshold?: number;
  /** Maximum number of results (default: 5) */
  matchCount?: number;
  /** Optional metadata filters */
  metadataFilter?: Record<string, unknown>;
}

/**
 * Vector search result with similarity score
 */
export interface VectorSearchResult {
  id: string;
  content: string;
  similarity: number;
  metadata: RAGVectorMetadata;
  created_at: string;
}

/**
 * Hybrid search result combining vector and keyword scores
 */
export interface HybridSearchResult extends VectorSearchResult {
  keyword_rank?: number;
  combined_score?: number;
}

// =============================================================================
// Embedding Generation Types
// =============================================================================

/**
 * Request to generate embeddings
 */
export interface EmbeddingRequest {
  /** Text content to embed */
  content: string;
  /** Embedding model to use */
  model?: EmbeddingModel;
}

/**
 * Response from embedding generation
 */
export interface EmbeddingResponse {
  success: boolean;
  embedding?: number[];
  dimensions?: number;
  model?: EmbeddingModel;
  error?: string;
  usage?: {
    promptTokens: number;
    totalTokens: number;
  };
}

// =============================================================================
// Document Storage Types
// =============================================================================

/**
 * Request to store a document with embedding
 */
export interface StoreDocumentRequest {
  /** Document content */
  content: string;
  /** Optional metadata */
  metadata?: RAGVectorMetadata;
  /** Embedding model to use */
  model?: EmbeddingModel;
}

/**
 * Response from document storage
 */
export interface StoreDocumentResponse {
  success: boolean;
  id?: string;
  created_at?: string;
  error?: string;
}

/**
 * Batch store request
 */
export interface BatchStoreRequest {
  documents: StoreDocumentRequest[];
  /** Continue on individual document errors */
  continueOnError?: boolean;
}

/**
 * Batch store response
 */
export interface BatchStoreResponse {
  success: boolean;
  results: StoreDocumentResponse[];
  totalStored: number;
  totalFailed: number;
  errors?: string[];
}

// =============================================================================
// Semantic Search Types
// =============================================================================

/**
 * Semantic search request
 */
export interface SemanticSearchRequest {
  /** Search query text */
  query: string;
  /** Similarity threshold (0-1) */
  threshold?: number;
  /** Number of results to return */
  limit?: number;
  /** Optional metadata filters */
  filters?: Record<string, unknown>;
}

/**
 * Semantic search response
 */
export interface SemanticSearchResponse {
  success: boolean;
  results?: VectorSearchResult[];
  query?: string;
  model?: EmbeddingModel;
  searchTimeMs?: number;
  error?: string;
}

// =============================================================================
// RAG Pipeline Types
// =============================================================================

/**
 * RAG query configuration
 */
export interface RAGQueryConfig {
  /** Question to answer */
  question: string;
  /** Number of context chunks to retrieve */
  topK?: number;
  /** Similarity threshold for retrieval */
  threshold?: number;
  /** LLM model for generation */
  generationModel?: string;
  /** System prompt for generation */
  systemPrompt?: string;
  /** Maximum tokens for generation */
  maxTokens?: number;
  /** Temperature for generation */
  temperature?: number;
}

/**
 * RAG pipeline result
 */
export interface RAGPipelineResult {
  success: boolean;
  question: string;
  answer?: string;
  sourceChunks?: VectorSearchResult[];
  retrievalTimeMs?: number;
  generationTimeMs?: number;
  totalTimeMs?: number;
  model?: string;
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost?: number;
  error?: string;
}

// =============================================================================
// Index Configuration Types
// =============================================================================

/**
 * pgvector index types
 */
export type VectorIndexType = 'ivfflat' | 'hnsw';

/**
 * IVFFlat index configuration
 */
export interface IVFFlatConfig {
  type: 'ivfflat';
  /** Number of lists (clusters) */
  lists: number;
  /** Distance operator */
  operator: 'vector_cosine_ops' | 'vector_l2_ops' | 'vector_ip_ops';
}

/**
 * HNSW index configuration
 */
export interface HNSWConfig {
  type: 'hnsw';
  /** Maximum connections per node */
  m: number;
  /** Construction time search depth */
  efConstruction: number;
  /** Distance operator */
  operator: 'vector_cosine_ops' | 'vector_l2_ops' | 'vector_ip_ops';
}

/**
 * Combined index configuration
 */
export type VectorIndexConfig = IVFFlatConfig | HNSWConfig;

// =============================================================================
// Connection & Pooling Types
// =============================================================================

/**
 * Supabase connection configuration
 */
export interface SupabaseConnectionConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  options?: {
    /** Enable realtime subscriptions */
    realtime?: boolean;
    /** Request timeout in ms */
    timeout?: number;
    /** Retry configuration */
    retry?: {
      maxRetries: number;
      retryDelay: number;
    };
  };
}

/**
 * Connection pool configuration for high-throughput scenarios
 */
export interface ConnectionPoolConfig {
  /** Maximum concurrent connections */
  maxConnections: number;
  /** Connection timeout in ms */
  connectionTimeout: number;
  /** Idle connection timeout in ms */
  idleTimeout: number;
  /** Enable connection pooling */
  pooling: boolean;
}

// =============================================================================
// Health Check Types
// =============================================================================

/**
 * Health check response
 */
export interface SupabaseHealthCheck {
  success: boolean;
  supabase: boolean;
  pgvector: boolean;
  edgeFunction: boolean;
  latencyMs?: number;
  error?: string;
}

// =============================================================================
// Export Model Configurations
// =============================================================================

/**
 * Pre-configured embedding models
 */
export const EMBEDDING_MODELS: Record<EmbeddingModel, EmbeddingModelConfig> = {
  'together/baai/bge-large-en-v1.5': {
    id: 'together/baai/bge-large-en-v1.5',
    name: 'BGE Large (Together AI)',
    provider: 'openrouter',
    dimensions: 1024,
    costPer1MTokens: 0.01,
    maxInputTokens: 512,
  },
  'openai/text-embedding-3-small': {
    id: 'openai/text-embedding-3-small',
    name: 'Text Embedding 3 Small (OpenAI)',
    provider: 'openai',
    dimensions: 1536,
    costPer1MTokens: 0.02,
    maxInputTokens: 8191,
  },
  'openai/text-embedding-3-large': {
    id: 'openai/text-embedding-3-large',
    name: 'Text Embedding 3 Large (OpenAI)',
    provider: 'openai',
    dimensions: 3072,
    costPer1MTokens: 0.13,
    maxInputTokens: 8191,
  },
  'huggingface/bge-large-en-v1.5': {
    id: 'huggingface/bge-large-en-v1.5',
    name: 'BGE Large (HuggingFace)',
    provider: 'huggingface',
    dimensions: 1024,
    costPer1MTokens: 0,
    maxInputTokens: 512,
  },
};

/**
 * Default search parameters
 */
export const DEFAULT_SEARCH_PARAMS = {
  matchThreshold: 0.7,
  matchCount: 5,
} as const;

/**
 * Index configuration recommendations by dataset size
 */
export const INDEX_RECOMMENDATIONS: Record<string, VectorIndexConfig> = {
  small: {
    type: 'ivfflat',
    lists: 10,
    operator: 'vector_cosine_ops',
  },
  medium: {
    type: 'ivfflat',
    lists: 100,
    operator: 'vector_cosine_ops',
  },
  large: {
    type: 'hnsw',
    m: 16,
    efConstruction: 64,
    operator: 'vector_cosine_ops',
  },
};
