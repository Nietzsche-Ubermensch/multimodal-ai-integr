import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '@/middleware/auth';
import { validateRerankRequest } from '@/middleware/validation';
import logger from '@/utils/logger';

const router = Router();

router.post(
  '/',
  authenticateToken,
  validateRerankRequest,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { provider, model, query, documents } = req.body;

      logger.info(
        {
          userId: req.user?.id,
          provider,
          model,
          documentCount: documents.length,
        },
        'Rerank request'
      );

      res.status(501).json({
        error: {
          type: 'not_implemented',
          message: 'Rerank endpoint not yet implemented',
          code: 'NOT_IMPLEMENTED',
        },
      });
    } catch (error: any) {
      logger.error({ error, userId: req.user?.id }, 'Rerank error');

      res.status(500).json({
        error: {
          type: 'internal_error',
          message: error.message || 'Rerank request failed',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }
);

export default router;
