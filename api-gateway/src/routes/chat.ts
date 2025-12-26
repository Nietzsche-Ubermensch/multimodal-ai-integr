import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '@/middleware/auth';
import { validateChatRequest } from '@/middleware/validation';
import { chatRateLimiter } from '@/middleware/rateLimit';
import { AnthropicService } from '@/services/providers/anthropic';
import { DeepSeekService } from '@/services/providers/deepseek';
import { XAIService } from '@/services/providers/xai';
import { OpenRouterService } from '@/services/providers/openrouter';
import { NvidiaService } from '@/services/providers/nvidia';
import logger from '@/utils/logger';

const router = Router();

const providerServices: Record<string, any> = {
  anthropic: new AnthropicService(),
  deepseek: new DeepSeekService(),
  xai: new XAIService(),
  openrouter: new OpenRouterService(),
  nvidia_nim: new NvidiaService(),
};

router.post(
  '/',
  authenticateToken,
  chatRateLimiter,
  validateChatRequest,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { provider, model, messages, stream, ...options } = req.body;

      const service = providerServices[provider];

      if (!service) {
        res.status(400).json({
          error: {
            type: 'validation_error',
            message: `Unknown provider: ${provider}`,
            code: 'UNKNOWN_PROVIDER',
            availableProviders: Object.keys(providerServices),
          },
        });
        return;
      }

      logger.info(
        {
          userId: req.user?.id,
          provider,
          model,
          messageCount: messages.length,
          stream,
        },
        'Chat request'
      );

      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const streamResponse = await service.streamChat({
          model,
          messages,
          ...options,
        });

        for await (const chunk of streamResponse) {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }

        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        const response = await service.chat({
          model,
          messages,
          ...options,
        });

        res.json(response);
      }
    } catch (error: any) {
      logger.error({ error, userId: req.user?.id }, 'Chat error');

      if (res.headersSent) {
        res.end();
        return;
      }

      res.status(error.statusCode || 500).json({
        error: {
          type: 'provider_error',
          message: error.message || 'Chat request failed',
          code: error.code || 'PROVIDER_ERROR',
          provider: req.body.provider,
        },
      });
    }
  }
);

export default router;
