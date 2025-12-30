import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '@/middleware/auth';
import { validateEmbeddingsRequest } from '@/middleware/validation';
import { OpenRouterService } from '@/services/providers/openrouter';
import logger from '@/utils/logger';

const router = Router();

router.post(
  '/',
  authenticateToken,
  validateEmbeddingsRequest,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { provider, model, input } = req.body;

      logger.info(
        {
          userId: req.user?.id,
          provider,
          model,
        },
        'Embeddings request'
      );

      // Support OpenRouter provider (includes Together AI models)
      if (provider === 'openrouter') {
        const openRouterService = new OpenRouterService();
        const response = await openRouterService.embeddings({
          model,
          input,
        });
        
        res.json(response);
        return;
      }

      res.status(400).json({
        error: {
          type: 'unsupported_provider',
          message: `Embeddings not supported for provider: ${provider}. Use 'openrouter' with Together AI models like 'together/baai/bge-large-en-v1.5'.`,
          code: 'UNSUPPORTED_PROVIDER',
        },
      });
    } catch (error: any) {
      logger.error({ error, userId: req.user?.id }, 'Embeddings error');

      res.status(500).json({
        error: {
          type: 'internal_error',
          message: error.message || 'Embeddings request failed',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }
);

export default router;
