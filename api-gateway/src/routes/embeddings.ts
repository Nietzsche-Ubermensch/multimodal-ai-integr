import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '@/middleware/auth';
import { validateEmbeddingsRequest } from '@/middleware/validation';
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

      res.status(501).json({
        error: {
          type: 'not_implemented',
          message: 'Embeddings endpoint not yet implemented',
          code: 'NOT_IMPLEMENTED',
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
