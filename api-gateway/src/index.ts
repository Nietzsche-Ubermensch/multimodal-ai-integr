import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import config from '@/config/env';
import logger from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { defaultRateLimiter } from '@/middleware/rateLimit';
import chatRouter from '@/routes/chat';
import embeddingsRouter from '@/routes/embeddings';
import rerankRouter from '@/routes/rerank';
import providersRouter from '@/routes/providers';
import healthRouter from '@/routes/health';
import authRouter from '@/routes/auth';

const app: Application = express();

app.use((req, res, next) => {
  (req as any).id = uuidv4();
  next();
});

app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use(helmet());

app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(defaultRateLimiter);

app.get('/', (req, res) => {
  res.json({
    name: 'AI Integration Gateway',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      auth: '/api/v1/auth',
      chat: '/api/v1/chat',
      embeddings: '/api/v1/embeddings',
      rerank: '/api/v1/rerank',
      providers: '/api/v1/providers',
      health: '/api/v1/health',
    },
  });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/embeddings', embeddingsRouter);
app.use('/api/v1/rerank', rerankRouter);
app.use('/api/v1/providers', providersRouter);
app.use('/api/v1/health', healthRouter);

app.use((req, res) => {
  res.status(404).json({
    error: {
      type: 'not_found',
      message: 'Endpoint not found',
      code: 'NOT_FOUND',
      path: req.path,
    },
  });
});

app.use(errorHandler);

const PORT = config.server.port;

app.listen(PORT, () => {
  logger.info(`🚀 AI Integration Gateway running on port ${PORT}`);
  logger.info(`📍 Environment: ${config.server.env}`);
  logger.info(`🔗 Base URL: ${config.server.baseUrl}`);
  logger.info(`📊 Metrics: ${config.metrics.enabled ? `Enabled on port ${config.metrics.port}` : 'Disabled'}`);
});

export default app;
