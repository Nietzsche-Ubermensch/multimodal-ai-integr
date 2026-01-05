// Custom hook for Supabase AI integration
import { useState, useCallback } from 'react';

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  tokenCount: number;
}

export interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export interface RAGDocument {
  id: string;
  content: string;
  metadata?: Record<string, unknown>;
  embedding?: number[];
}

export interface UseSupabaseAIReturn {
  // State
  isConnected: boolean;
  isProcessing: boolean;
  error: string | null;
  
  // Embedding operations
  generateEmbedding: (text: string, model?: string) => Promise<EmbeddingResult>;
  generateBatchEmbeddings: (texts: string[], model?: string) => Promise<EmbeddingResult[]>;
  
  // Vector search
  semanticSearch: (query: string, limit?: number, threshold?: number) => Promise<SearchResult[]>;
  hybridSearch: (query: string, limit?: number) => Promise<SearchResult[]>;
  
  // Document operations
  ingestDocument: (doc: RAGDocument) => Promise<void>;
  ingestDocuments: (docs: RAGDocument[]) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  
  // Edge Functions
  invokeEdgeFunction: <T>(name: string, payload: unknown) => Promise<T>;
  
  // Connection
  connect: (supabaseUrl: string, supabaseKey: string) => Promise<void>;
  disconnect: () => void;
}

// Supabase AI Embedding models
export const SUPABASE_EMBEDDING_MODELS = {
  'gte-small': {
    id: 'gte-small',
    name: 'GTE Small',
    dimensions: 384,
    maxTokens: 512,
    description: 'Fast, efficient embedding model',
  },
  'multilingual-e5-large': {
    id: 'multilingual-e5-large', 
    name: 'Multilingual E5 Large',
    dimensions: 1024,
    maxTokens: 512,
    description: 'Multilingual embeddings for 100+ languages',
  },
} as const;

export function useSupabaseAI(): UseSupabaseAIReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supabaseConfig, setSupabaseConfig] = useState<{url: string; key: string} | null>(null);

  const connect = useCallback(async (supabaseUrl: string, supabaseKey: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // Validate connection by calling a simple endpoint
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to connect to Supabase');
      }
      
      setSupabaseConfig({ url: supabaseUrl, key: supabaseKey });
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setIsConnected(false);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setSupabaseConfig(null);
    setIsConnected(false);
  }, []);

  const invokeEdgeFunction = useCallback(async <T>(name: string, payload: unknown): Promise<T> => {
    if (!supabaseConfig) {
      throw new Error('Not connected to Supabase');
    }
    
    setIsProcessing(true);
    try {
      const response = await fetch(`${supabaseConfig.url}/functions/v1/${name}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseConfig.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Edge function error: ${response.statusText}`);
      }
      
      return await response.json();
    } finally {
      setIsProcessing(false);
    }
  }, [supabaseConfig]);

  const generateEmbedding = useCallback(async (
    text: string, 
    model = 'gte-small'
  ): Promise<EmbeddingResult> => {
    if (!supabaseConfig) {
      // Simulate for demo
      const dimensions = model === 'multilingual-e5-large' ? 1024 : 384;
      return {
        embedding: Array.from({ length: dimensions }, () => Math.random() * 2 - 1),
        model,
        tokenCount: text.split(/\s+/).length,
      };
    }
    
    return invokeEdgeFunction('generate-embedding', { text, model });
  }, [supabaseConfig, invokeEdgeFunction]);

  const generateBatchEmbeddings = useCallback(async (
    texts: string[],
    model = 'gte-small'
  ): Promise<EmbeddingResult[]> => {
    setIsProcessing(true);
    try {
      const results = await Promise.all(
        texts.map(text => generateEmbedding(text, model))
      );
      return results;
    } finally {
      setIsProcessing(false);
    }
  }, [generateEmbedding]);

  const semanticSearch = useCallback(async (
    query: string,
    limit = 5,
    threshold = 0.7
  ): Promise<SearchResult[]> => {
    if (!supabaseConfig) {
      // Demo mode: return mock results
      return [
        {
          id: '1',
          content: `Relevant content for: "${query}"`,
          metadata: { source: 'demo' },
          similarity: 0.95,
        },
        {
          id: '2',
          content: 'Additional context information...',
          metadata: { source: 'demo' },
          similarity: 0.85,
        },
      ];
    }

    const embedding = await generateEmbedding(query);
    
    return invokeEdgeFunction('semantic-search', {
      embedding: embedding.embedding,
      limit,
      threshold,
    });
  }, [supabaseConfig, generateEmbedding, invokeEdgeFunction]);

  const hybridSearch = useCallback(async (
    query: string,
    limit = 5
  ): Promise<SearchResult[]> => {
    if (!supabaseConfig) {
      // Demo mode
      return semanticSearch(query, limit);
    }

    return invokeEdgeFunction('hybrid-search', { query, limit });
  }, [supabaseConfig, semanticSearch, invokeEdgeFunction]);

  const ingestDocument = useCallback(async (doc: RAGDocument) => {
    setIsProcessing(true);
    try {
      const embedding = await generateEmbedding(doc.content);
      
      if (supabaseConfig) {
        await invokeEdgeFunction('ingest-document', {
          ...doc,
          embedding: embedding.embedding,
        });
      }
    } finally {
      setIsProcessing(false);
    }
  }, [supabaseConfig, generateEmbedding, invokeEdgeFunction]);

  const ingestDocuments = useCallback(async (docs: RAGDocument[]) => {
    setIsProcessing(true);
    try {
      for (const doc of docs) {
        await ingestDocument(doc);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [ingestDocument]);

  const deleteDocument = useCallback(async (id: string) => {
    if (!supabaseConfig) return;
    
    await invokeEdgeFunction('delete-document', { id });
  }, [supabaseConfig, invokeEdgeFunction]);

  return {
    isConnected,
    isProcessing,
    error,
    generateEmbedding,
    generateBatchEmbeddings,
    semanticSearch,
    hybridSearch,
    ingestDocument,
    ingestDocuments,
    deleteDocument,
    invokeEdgeFunction,
    connect,
    disconnect,
  };
}
