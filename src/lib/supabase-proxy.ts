/**
 * Supabase Proxy - Secure backend proxy functions for RAG operations
 *
 * All API keys come from environment variables, never from frontend state.
 * This module provides secure server-side operations for:
 * - Embedding generation (via Edge Function)
 * - Document storage
 * - Semantic search
 */

// =============================================================================
// Configuration - All keys from environment variables
// =============================================================================

const getConfig = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
    );
  }

  return { supabaseUrl, supabaseAnonKey };
};

// =============================================================================
// Input Validation
// =============================================================================

const MAX_TEXT_LENGTH = 8000;
const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

export interface ValidationError {
  field: string;
  message: string;
}

export class InputValidationError extends Error {
  errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super(`Validation failed: ${errors.map((e) => e.message).join(', ')}`);
    this.name = 'InputValidationError';
    this.errors = errors;
  }
}

/**
 * Validates text input for embedding/storage
 */
function validateText(text: unknown, fieldName: string = 'text'): string {
  const errors: ValidationError[] = [];

  if (text === undefined || text === null) {
    errors.push({ field: fieldName, message: `${fieldName} is required` });
    throw new InputValidationError(errors);
  }

  if (typeof text !== 'string') {
    errors.push({ field: fieldName, message: `${fieldName} must be a string` });
    throw new InputValidationError(errors);
  }

  const trimmed = text.trim();

  if (trimmed.length === 0) {
    errors.push({ field: fieldName, message: `${fieldName} cannot be empty` });
    throw new InputValidationError(errors);
  }

  if (trimmed.length > MAX_TEXT_LENGTH) {
    errors.push({
      field: fieldName,
      message: `${fieldName} exceeds maximum length of ${MAX_TEXT_LENGTH} characters (got ${trimmed.length})`,
    });
    throw new InputValidationError(errors);
  }

  return trimmed;
}

/**
 * Validates URL format
 */
function validateUrl(url: unknown, fieldName: string = 'url'): string | undefined {
  if (url === undefined || url === null || url === '') {
    return undefined;
  }

  if (typeof url !== 'string') {
    throw new InputValidationError([
      { field: fieldName, message: `${fieldName} must be a string` },
    ]);
  }

  const trimmed = url.trim();

  if (!URL_REGEX.test(trimmed)) {
    throw new InputValidationError([
      { field: fieldName, message: `${fieldName} is not a valid URL` },
    ]);
  }

  return trimmed;
}

/**
 * Sanitizes user input to prevent XSS and injection attacks
 */
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validates and sanitizes metadata object
 */
function validateMetadata(
  metadata: unknown
): Record<string, unknown> | undefined {
  if (metadata === undefined || metadata === null) {
    return undefined;
  }

  if (typeof metadata !== 'object' || Array.isArray(metadata)) {
    throw new InputValidationError([
      { field: 'metadata', message: 'metadata must be an object' },
    ]);
  }

  // Deep sanitize string values in metadata
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata as Record<string, unknown>)) {
    const sanitizedKey = sanitizeInput(key);
    if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitizeInput(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[sanitizedKey] = value;
    } else if (value === null) {
      sanitized[sanitizedKey] = null;
    }
    // Skip functions, symbols, and other non-serializable types
  }

  return sanitized;
}

/**
 * Validates numeric parameters
 */
function validateNumber(
  value: unknown,
  fieldName: string,
  min: number,
  max: number,
  defaultValue: number
): number {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  const num = Number(value);

  if (isNaN(num)) {
    throw new InputValidationError([
      { field: fieldName, message: `${fieldName} must be a number` },
    ]);
  }

  if (num < min || num > max) {
    throw new InputValidationError([
      {
        field: fieldName,
        message: `${fieldName} must be between ${min} and ${max}`,
      },
    ]);
  }

  return num;
}

// =============================================================================
// Response Types
// =============================================================================

export interface EmbeddingResponse {
  success: boolean;
  embedding?: number[];
  error?: string;
  dimensions?: number;
}

export interface StoreDocumentResponse {
  success: boolean;
  id?: string;
  created_at?: string;
  error?: string;
}

export interface SearchResult {
  id: string;
  content: string;
  similarity: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface SemanticSearchResponse {
  success: boolean;
  results?: SearchResult[];
  error?: string;
}

// =============================================================================
// Proxy Functions
// =============================================================================

/**
 * Generates an embedding for the given text using the Edge Function.
 * The OpenRouter API key is stored as a secret in the Edge Function,
 * never exposed to the frontend.
 *
 * @param text - Text to generate embedding for (max 8000 chars)
 * @returns Embedding vector (1536 dimensions)
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResponse> {
  try {
    // Validate input
    const validatedText = validateText(text, 'text');
    const sanitizedText = sanitizeInput(validatedText);

    const { supabaseUrl, supabaseAnonKey } = getConfig();

    // Call the Edge Function (API key is a secret on the server)
    const response = await fetch(
      `${supabaseUrl}/functions/v1/generate-embedding`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ content: sanitizedText }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    // If the Edge Function returns the embedding directly
    if (data.embedding) {
      return {
        success: true,
        embedding: data.embedding,
        dimensions: data.embedding.length,
      };
    }

    // If it just stored the document (current implementation)
    // We need to fetch the embedding from the stored record
    if (data.id) {
      const embeddingResponse = await fetch(
        `${supabaseUrl}/rest/v1/rag_vectors?id=eq.${data.id}&select=embedding`,
        {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        }
      );

      if (embeddingResponse.ok) {
        const [record] = await embeddingResponse.json();
        if (record?.embedding) {
          return {
            success: true,
            embedding: record.embedding,
            dimensions: record.embedding.length,
          };
        }
      }
    }

    return {
      success: true,
      dimensions: data.embedding_dimensions,
    };
  } catch (error) {
    if (error instanceof InputValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Stores a document with its embedding in the rag_vectors table.
 * Generates the embedding via the Edge Function, then stores both.
 *
 * @param content - Document content (max 8000 chars)
 * @param metadata - Optional metadata object
 * @returns Stored document ID and timestamp
 */
export async function storeDocument(
  content: string,
  metadata?: Record<string, unknown>
): Promise<StoreDocumentResponse> {
  try {
    // Validate inputs
    const validatedContent = validateText(content, 'content');
    const sanitizedContent = sanitizeInput(validatedContent);
    const validatedMetadata = validateMetadata(metadata);

    // Validate URLs in metadata if present
    if (validatedMetadata?.source_url) {
      validateUrl(validatedMetadata.source_url, 'metadata.source_url');
    }
    if (validatedMetadata?.url) {
      validateUrl(validatedMetadata.url, 'metadata.url');
    }

    const { supabaseUrl, supabaseAnonKey } = getConfig();

    // Call the Edge Function which generates embedding AND stores
    const response = await fetch(
      `${supabaseUrl}/functions/v1/generate-embedding`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          content: sanitizedContent,
          metadata: validatedMetadata,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      id: data.id,
      created_at: data.created_at,
    };
  } catch (error) {
    if (error instanceof InputValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Performs semantic search against stored documents.
 * First generates an embedding for the query, then searches via match_documents.
 *
 * @param query - Search query text (max 8000 chars)
 * @param threshold - Similarity threshold 0-1 (default: 0.7)
 * @param limit - Maximum results to return 1-100 (default: 5)
 * @returns Matching documents with similarity scores
 */
export async function semanticSearch(
  query: string,
  threshold: number = 0.7,
  limit: number = 5
): Promise<SemanticSearchResponse> {
  try {
    // Validate inputs
    const validatedQuery = validateText(query, 'query');
    const sanitizedQuery = sanitizeInput(validatedQuery);
    const validatedThreshold = validateNumber(threshold, 'threshold', 0, 1, 0.7);
    const validatedLimit = validateNumber(limit, 'limit', 1, 100, 5);

    const { supabaseUrl, supabaseAnonKey } = getConfig();

    // Step 1: Generate embedding for the query
    const embeddingResponse = await generateEmbedding(sanitizedQuery);

    if (!embeddingResponse.success || !embeddingResponse.embedding) {
      return {
        success: false,
        error: embeddingResponse.error || 'Failed to generate query embedding',
      };
    }

    // Step 2: Call match_documents RPC
    const searchResponse = await fetch(
      `${supabaseUrl}/rest/v1/rpc/match_documents`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          query_embedding: embeddingResponse.embedding,
          match_threshold: validatedThreshold,
          match_count: validatedLimit,
        }),
      }
    );

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Search failed: HTTP ${searchResponse.status}`,
      };
    }

    const results = await searchResponse.json();

    return {
      success: true,
      results: results.map((r: SearchResult) => ({
        id: r.id,
        content: r.content,
        similarity: r.similarity,
        metadata: r.metadata || {},
        created_at: r.created_at,
      })),
    };
  } catch (error) {
    if (error instanceof InputValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Batch store multiple documents
 *
 * @param documents - Array of { content, metadata } objects
 * @returns Array of store results
 */
export async function batchStoreDocuments(
  documents: Array<{ content: string; metadata?: Record<string, unknown> }>
): Promise<StoreDocumentResponse[]> {
  const results: StoreDocumentResponse[] = [];

  for (const doc of documents) {
    const result = await storeDocument(doc.content, doc.metadata);
    results.push(result);

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
}

/**
 * Health check for the Supabase connection
 */
export async function healthCheck(): Promise<{
  success: boolean;
  supabase: boolean;
  edgeFunction: boolean;
  error?: string;
}> {
  try {
    const { supabaseUrl, supabaseAnonKey } = getConfig();

    // Check Supabase REST API
    const supabaseCheck = await fetch(`${supabaseUrl}/rest/v1/rag_vectors?limit=1`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });

    // Check Edge Function (with minimal payload)
    const edgeFunctionCheck = await fetch(
      `${supabaseUrl}/functions/v1/generate-embedding`,
      {
        method: 'OPTIONS',
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      }
    );

    return {
      success: supabaseCheck.ok && edgeFunctionCheck.ok,
      supabase: supabaseCheck.ok,
      edgeFunction: edgeFunctionCheck.ok,
    };
  } catch (error) {
    return {
      success: false,
      supabase: false,
      edgeFunction: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
