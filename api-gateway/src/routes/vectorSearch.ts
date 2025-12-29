import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthRequest, authenticateToken } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { createRateLimiter } from '@/middleware/rateLimit';
import logger from '@/utils/logger';
import config from '@/config/env';

const router = Router();

// Validation schema for vector search
const vectorSearchRequestSchema = z.object({
  query: z.string().min(1, 'Query is required').max(8000, 'Query must be less than 8000 characters'),
  threshold: z.number().min(0).max(1).optional().default(0.7),
  limit: z.number().int().positive().max(100).optional().default(5),
  supabaseUrl: z.string().url('Valid Supabase URL is required'),
  supabaseKey: z.string().min(1, 'Supabase API key is required'),
  embeddingProvider: z.string().optional().default('openai'),
  embeddingModel: z.string().optional().default('text-embedding-3-small'),
});

const validateVectorSearchRequest = validateRequest(vectorSearchRequestSchema);

// Rate limiter for vector search (more generous than chat)
const vectorSearchRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many vector search requests, please slow down',
});

/**
 * Generate embedding using OpenAI API
 * This is server-side only to keep API keys secure
 */
async function generateEmbedding(
  text: string,
  model: string = 'text-embedding-3-small'
): Promise<number[]> {
  const openaiApiKey = config.providers.openrouter; // Using OpenRouter as fallback
  
  if (!openaiApiKey) {
    throw new Error('OpenAI/OpenRouter API key not configured on server');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    logger.error({ error, model, textLength: text.length }, 'Embedding generation failed');
    throw error;
  }
}

/**
 * POST /api/v1/vector-search
 * Performs vector similarity search:
 * 1. Generates embedding for the query (server-side)
 * 2. Searches Supabase for similar documents
 * 3. Returns results with similarity scores
 */
router.post(
  '/',
  authenticateToken,
  vectorSearchRateLimiter,
  validateVectorSearchRequest,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const {
        query,
        threshold,
        limit,
        supabaseUrl,
        supabaseKey,
        embeddingProvider,
        embeddingModel,
      } = req.body;

      logger.info(
        {
          userId: req.user?.id,
          queryLength: query.length,
          threshold,
          limit,
          embeddingProvider,
          embeddingModel,
        },
        'Vector search request'
      );

      // Step 1: Generate embedding server-side
      const startEmbedding = performance.now();
      const queryEmbedding = await generateEmbedding(query, embeddingModel);
      const embeddingTime = Math.round(performance.now() - startEmbedding);

      logger.info(
        {
          userId: req.user?.id,
          embeddingDimension: queryEmbedding.length,
          embeddingTime,
        },
        'Embedding generated'
      );

      // Step 2: Search Supabase
      const startSearch = performance.now();
      const searchResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/match_documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          query_embedding: queryEmbedding,
          match_threshold: threshold,
          match_count: limit,
        }),
      });

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        throw new Error(
          `Supabase search failed: ${searchResponse.status} ${searchResponse.statusText} - ${errorText}`
        );
      }

      const results = await searchResponse.json();
      const searchTime = Math.round(performance.now() - startSearch);

      logger.info(
        {
          userId: req.user?.id,
          resultCount: results.length,
          searchTime,
          totalTime: embeddingTime + searchTime,
        },
        'Vector search completed'
      );

      // Step 3: Return results
      res.json({
        success: true,
        query,
        results: results.map((r: any) => ({
          id: r.id,
          content: r.content,
          similarity: r.similarity,
          metadata: r.metadata || {},
          created_at: r.created_at,
        })),
        metadata: {
          resultCount: results.length,
          threshold,
          limit,
          embeddingModel,
          embeddingTime,
          searchTime,
          totalTime: embeddingTime + searchTime,
        },
      });
    } catch (error: any) {
      logger.error({ error, userId: req.user?.id }, 'Vector search error');

      res.status(error.statusCode || 500).json({
        error: {
          type: 'vector_search_error',
          message: error.message || 'Vector search failed',
          code: error.code || 'VECTOR_SEARCH_ERROR',
        },
      });
    }
  }
);

export default router;
