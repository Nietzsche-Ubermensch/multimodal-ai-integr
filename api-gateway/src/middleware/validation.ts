import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import logger from '@/utils/logger';

export const chatRequestSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  model: z.string().min(1, 'Model is required'),
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.union([
        z.string(),
        z.array(
          z.union([
            z.object({
              type: z.literal('text'),
              text: z.string(),
            }),
            z.object({
              type: z.literal('image_url'),
              image_url: z.object({
                url: z.string().url(),
                detail: z.enum(['auto', 'low', 'high']).optional(),
              }),
            }),
          ])
        ),
      ]),
    })
  ).min(1, 'At least one message is required'),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().positive().optional(),
  top_p: z.number().min(0).max(1).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
  stream: z.boolean().optional().default(false),
  tools: z.array(z.any()).optional(),
  tool_choice: z.union([z.literal('auto'), z.literal('none'), z.object({})]).optional(),
});

export const embeddingsRequestSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  model: z.string().min(1, 'Model is required'),
  input: z.union([z.string(), z.array(z.string())]),
  encoding_format: z.enum(['float', 'base64']).optional(),
});

export const rerankRequestSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  model: z.string().min(1, 'Model is required'),
  query: z.string().min(1, 'Query is required'),
  documents: z.array(z.string()).min(1, 'At least one document is required'),
  top_n: z.number().positive().optional(),
  return_documents: z.boolean().optional().default(true),
});

export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: {
            type: 'validation_error',
            message: 'Invalid request body',
            code: 'VALIDATION_ERROR',
            details: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
        });
        return;
      }

      logger.error({ error }, 'Validation error');
      res.status(500).json({
        error: {
          type: 'internal_error',
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  };
};

export const validateChatRequest = validateRequest(chatRequestSchema);
export const validateEmbeddingsRequest = validateRequest(embeddingsRequestSchema);
export const validateRerankRequest = validateRequest(rerankRequestSchema);
