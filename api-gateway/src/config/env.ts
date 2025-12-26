import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  API_BASE_URL: z.string().url().default('http://localhost:3001'),
  
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRY: z.string().default('24h'),
  
  REDIS_URL: z.string().default('redis://localhost:6379'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  CORS_ORIGIN: z.string().default('*'),
  
  ANTHROPIC_API_KEY: z.string().optional(),
  DEEPSEEK_API_KEY: z.string().optional(),
  XAI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  LITELLM_API_KEY: z.string().optional(),
  NVIDIA_NIM_API_KEY: z.string().optional(),
  PERPLEXITY_API_KEY: z.string().optional(),
  HF_TOKEN: z.string().optional(),
  
  DATABASE_URL: z.string().optional(),
  
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  ENABLE_METRICS: z.string().transform(val => val === 'true').default('true'),
  METRICS_PORT: z.string().transform(Number).default('9090'),
  
  ENCRYPTION_KEY: z.string().length(32),
  
  CACHE_TTL_SECONDS: z.string().transform(Number).default('3600'),
});

type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error('❌ Invalid environment variables:');
  if (error instanceof z.ZodError) {
    error.errors.forEach(err => {
      console.error(`  ${err.path.join('.')}: ${err.message}`);
    });
  }
  process.exit(1);
}

export const config = {
  server: {
    env: env.NODE_ENV,
    port: env.PORT,
    baseUrl: env.API_BASE_URL,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
  },
  
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiry: env.JWT_EXPIRY,
  },
  
  rateLimit: {
    redisUrl: env.REDIS_URL,
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  
  cors: {
    origin: env.CORS_ORIGIN.split(',').map(o => o.trim()),
  },
  
  providers: {
    anthropic: env.ANTHROPIC_API_KEY,
    deepseek: env.DEEPSEEK_API_KEY,
    xai: env.XAI_API_KEY,
    openrouter: env.OPENROUTER_API_KEY,
    litellm: env.LITELLM_API_KEY,
    nvidia: env.NVIDIA_NIM_API_KEY,
    perplexity: env.PERPLEXITY_API_KEY,
    huggingface: env.HF_TOKEN,
  },
  
  database: {
    url: env.DATABASE_URL,
  },
  
  logging: {
    level: env.LOG_LEVEL,
  },
  
  metrics: {
    enabled: env.ENABLE_METRICS,
    port: env.METRICS_PORT,
  },
  
  security: {
    encryptionKey: env.ENCRYPTION_KEY,
  },
  
  cache: {
    ttl: env.CACHE_TTL_SECONDS,
  },
};

export default config;
