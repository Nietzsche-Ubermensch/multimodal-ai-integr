import { Router, Request, Response } from 'express';
import { getAllProviders } from '@/config/providers';
import config from '@/config/env';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const providers = getAllProviders();

  const providerStatus: Record<string, string> = {};

  for (const provider of providers) {
    const hasApiKey = !!config.providers[provider.id as keyof typeof config.providers];
    providerStatus[provider.id] = hasApiKey ? 'configured' : 'missing_key';
  }

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    providers: providerStatus,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB',
    },
  });
});

router.get('/live', (req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

router.get('/ready', (req: Request, res: Response): void => {
  res.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
});

export default router;
