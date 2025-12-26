import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import config from '@/config/env';
import logger from '@/utils/logger';

let redis: Redis | null = null;

try {
  redis = new Redis(config.rateLimit.redisUrl);
  
  redis.on('error', (err) => {
    logger.error({ err }, 'Redis connection error');
  });
  
  redis.on('connect', () => {
    logger.info('Redis connected for rate limiting');
  });
} catch (error) {
  logger.warn({ error }, 'Redis not available, using memory store for rate limiting');
}

export const createRateLimiter = (options?: {
  windowMs?: number;
  max?: number;
  message?: string;
}) => {
  const defaultOptions = {
    windowMs: options?.windowMs || config.rateLimit.windowMs,
    max: options?.max || config.rateLimit.maxRequests,
    message: options?.message || 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: any, res: any) => {
      res.status(429).json({
        error: {
          type: 'rate_limit_error',
          message: options?.message || 'Too many requests, please try again later',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: res.getHeader('Retry-After'),
        },
      });
    },
  };

  if (redis) {
    return rateLimit({
      ...defaultOptions,
      store: new RedisStore({
        sendCommand: (...args: string[]) => redis!.call(...args),
        prefix: 'rl:',
      }),
    });
  }

  return rateLimit(defaultOptions);
};

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts, please try again later',
});

export const chatRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many chat requests, please slow down',
});

export const defaultRateLimiter = createRateLimiter();
