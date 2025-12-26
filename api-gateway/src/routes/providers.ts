import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '@/middleware/auth';
import { getAllProviders, getProvider } from '@/config/providers';
import config from '@/config/env';

const router = Router();

router.get('/', authenticateToken, (req: AuthRequest, res: Response): void => {
  const providers = getAllProviders();

  const providersWithStatus = providers.map(provider => {
    const hasApiKey = !!config.providers[provider.id as keyof typeof config.providers];

    return {
      id: provider.id,
      name: provider.name,
      status: hasApiKey ? 'configured' : 'missing_key',
      models: provider.models.map(m => ({
        id: m.id,
        name: m.name,
        contextWindow: m.contextWindow,
        maxTokens: m.maxTokens,
        supportsStreaming: m.supportsStreaming,
        supportsVision: m.supportsVision,
        supportsFunctionCalling: m.supportsFunctionCalling,
        pricing: {
          input: m.inputCostPer1M,
          output: m.outputCostPer1M,
        },
      })),
      capabilities: provider.capabilities,
    };
  });

  res.json({
    providers: providersWithStatus,
    total: providersWithStatus.length,
  });
});

router.get('/:providerId', authenticateToken, (req: AuthRequest, res: Response): void => {
  const { providerId } = req.params;
  const provider = getProvider(providerId);

  if (!provider) {
    res.status(404).json({
      error: {
        type: 'not_found',
        message: `Provider not found: ${providerId}`,
        code: 'PROVIDER_NOT_FOUND',
      },
    });
    return;
  }

  const hasApiKey = !!config.providers[provider.id as keyof typeof config.providers];

  res.json({
    id: provider.id,
    name: provider.name,
    status: hasApiKey ? 'configured' : 'missing_key',
    baseUrl: provider.baseUrl,
    models: provider.models,
    capabilities: provider.capabilities,
  });
});

export default router;
