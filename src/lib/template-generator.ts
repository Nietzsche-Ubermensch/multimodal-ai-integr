export interface TemplateFile {
  path: string;
  content: string;
  description: string;
}

export function generateNextJsApiRoute(provider: string): TemplateFile {
  const providerConfigs: Record<string, { import: string; client: string; model: string }> = {
    anthropic: {
      import: `import Anthropic from '@anthropic-ai/sdk';`,
      client: `const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});`,
      model: "claude-sonnet-4-5-20250929",
    },
    openrouter: {
      import: `import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';`,
      client: `const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});`,
      model: "openai/gpt-4o",
    },
    deepseek: {
      import: `import OpenAI from 'openai';`,
      client: `const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});`,
      model: "deepseek-chat",
    },
    xai: {
      import: `import OpenAI from 'openai';`,
      client: `const xai = new OpenAI({
  baseURL: 'https://api.x.ai/v1',
  apiKey: process.env.XAI_API_KEY,
});`,
      model: "grok-4",
    },
  };

  const config = providerConfigs[provider];
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  const content = `${config.import}

export const runtime = 'nodejs';
export const maxDuration = 60;

${config.client}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    const stream = await ${provider === "openrouter" ? "streamText" : `${provider}.chat.completions.create`}({
      ${provider === "openrouter" ? "model: openrouter" : "model"}('${config.model}'),
      messages,
      ${provider !== "openrouter" ? "stream: true," : ""}
    });

    ${
      provider === "openrouter"
        ? "return stream.toDataStreamResponse();"
        : `
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/event-stream' },
    });`
    }
  } catch (error) {
    console.error('${provider} API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}`;

  return {
    path: `app/api/${provider}/route.ts`,
    content,
    description: `Next.js API route for ${provider}`,
  };
}

export function generateExpressApiGateway(): TemplateFile[] {
  const indexTs = `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { config } from './config';
import { authenticateToken } from './middleware/auth';
import { chatRouter } from './routes/chat';
import { embeddingsRouter } from './routes/embeddings';
import { healthRouter } from './routes/health';

const app = express();

app.use(helmet());
app.use(cors(config.cors));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP',
});

app.use('/api/', limiter);

app.use('/api/health', healthRouter);
app.use('/api/chat', authenticateToken, chatRouter);
app.use('/api/embeddings', authenticateToken, embeddingsRouter);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

const PORT = config.port || 3001;
app.listen(PORT, () => {
  console.log(\`API Gateway running on port \${PORT}\`);
});`;

  const configTs = `export const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  providers: {
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      baseURL: 'https://api.anthropic.com',
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    },
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com',
    },
    xai: {
      apiKey: process.env.XAI_API_KEY,
      baseURL: 'https://api.x.ai/v1',
    },
    nvidia: {
      apiKey: process.env.NVIDIA_NIM_API_KEY,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    },
    huggingface: {
      apiKey: process.env.HF_TOKEN,
    },
  },
};`;

  const authMiddleware = `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const user = jwt.verify(token, config.jwtSecret) as any;
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}`;

  const chatRoute = `import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { config } from '../config';
import { AuthRequest } from '../middleware/auth';

export const chatRouter = Router();

const providers = {
  anthropic: new Anthropic({ apiKey: config.providers.anthropic.apiKey }),
  deepseek: new OpenAI({
    baseURL: config.providers.deepseek.baseURL,
    apiKey: config.providers.deepseek.apiKey,
  }),
  xai: new OpenAI({
    baseURL: config.providers.xai.baseURL,
    apiKey: config.providers.xai.apiKey,
  }),
};

chatRouter.post('/', async (req: AuthRequest, res) => {
  try {
    const { provider, model, messages } = req.body;

    if (!provider || !model || !messages) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    switch (provider) {
      case 'anthropic':
        const anthropicStream = await providers.anthropic.messages.create({
          model,
          messages,
          max_tokens: 1024,
          stream: true,
        });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const event of anthropicStream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            res.write(\`data: \${JSON.stringify({ text: event.delta.text })}\\n\\n\`);
          }
        }
        res.end();
        break;

      case 'deepseek':
      case 'xai':
        const client = provider === 'deepseek' ? providers.deepseek : providers.xai;
        const stream = await client.chat.completions.create({
          model,
          messages,
          stream: true,
        });

        res.setHeader('Content-Type', 'text/event-stream');
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) {
            res.write(\`data: \${JSON.stringify({ text })}\\n\\n\`);
          }
        }
        res.end();
        break;

      default:
        res.status(400).json({ error: 'Unsupported provider' });
    }
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});`;

  const healthRoute = `import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});`;

  return [
    { path: "api-gateway/src/index.ts", content: indexTs, description: "Main Express server" },
    { path: "api-gateway/src/config.ts", content: configTs, description: "Configuration" },
    {
      path: "api-gateway/src/middleware/auth.ts",
      content: authMiddleware,
      description: "JWT authentication middleware",
    },
    { path: "api-gateway/src/routes/chat.ts", content: chatRoute, description: "Chat endpoint" },
    {
      path: "api-gateway/src/routes/health.ts",
      content: healthRoute,
      description: "Health check endpoint",
    },
  ];
}

export function generateSupabaseSchema(): TemplateFile {
  const content = `-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents table for RAG
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create HNSW index for fast similarity search
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);

-- Function for similarity search
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 5,
  filter JSONB DEFAULT '{}'
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE documents.metadata @> filter
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own documents
CREATE POLICY "Users can access own documents"
  ON documents
  FOR ALL
  USING (auth.uid() = (metadata->>'user_id')::UUID);

-- Users table (optional, extends Supabase auth)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`;

  return {
    path: "supabase/migrations/001_init.sql",
    content,
    description: "Supabase schema with pgvector",
  };
}

export function generateDockerCompose(includeServices: {
  litellm?: boolean;
  redis?: boolean;
  postgres?: boolean;
}): TemplateFile {
  let services = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:`;

  const dependencies: string[] = [];
  
  if (includeServices.postgres) dependencies.push("      - postgres");
  if (includeServices.redis) dependencies.push("      - redis");
  if (includeServices.litellm) dependencies.push("      - litellm");

  services += "\n" + dependencies.join("\n");

  if (includeServices.postgres) {
    services += `

  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data`;
  }

  if (includeServices.redis) {
    services += `

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data`;
  }

  if (includeServices.litellm) {
    services += `

  litellm:
    image: docker.litellm.ai/berriai/litellm-database:main-stable
    ports:
      - "4000:4000"
    environment:
      - LITELLM_MASTER_KEY=\${LITELLM_API_KEY}
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/litellm
    volumes:
      - ./litellm-config.yaml:/app/config.yaml
    depends_on:
      - postgres`;
  }

  services += `

volumes:`;
  
  if (includeServices.postgres) services += `
  postgres_data:`;
  if (includeServices.redis) services += `
  redis_data:`;

  return {
    path: "docker-compose.yml",
    content: services,
    description: "Docker Compose configuration",
  };
}

export function generateKubernetesManifests(): TemplateFile[] {
  const deployment = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-platform
  labels:
    app: ai-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ai-platform
  template:
    metadata:
      labels:
        app: ai-platform
    spec:
      containers:
      - name: app
        image: ai-platform:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        envFrom:
        - secretRef:
            name: ai-platform-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5`;

  const service = `apiVersion: v1
kind: Service
metadata:
  name: ai-platform
spec:
  selector:
    app: ai-platform
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer`;

  const ingress = `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ai-platform
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - ai-platform.example.com
    secretName: ai-platform-tls
  rules:
  - host: ai-platform.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ai-platform
            port:
              number: 80`;

  const secrets = `apiVersion: v1
kind: Secret
metadata:
  name: ai-platform-secrets
type: Opaque
stringData:
  ANTHROPIC_API_KEY: "sk-ant-..."
  OPENROUTER_API_KEY: "sk-or-..."
  JWT_SECRET: "your-secret-key"
  # Add other secrets here`;

  return [
    { path: "k8s/deployment.yaml", content: deployment, description: "Kubernetes deployment" },
    { path: "k8s/service.yaml", content: service, description: "Kubernetes service" },
    { path: "k8s/ingress.yaml", content: ingress, description: "Kubernetes ingress" },
    { path: "k8s/secrets.yaml", content: secrets, description: "Kubernetes secrets template" },
  ];
}

export function generateVercelConfig(): TemplateFile {
  const content = `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 300
    }
  },
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY": "@supabase-anon-key"
  },
  "build": {
    "env": {
      "ANTHROPIC_API_KEY": "@anthropic-api-key",
      "OPENROUTER_API_KEY": "@openrouter-api-key",
      "DEEPSEEK_API_KEY": "@deepseek-api-key",
      "XAI_API_KEY": "@xai-api-key",
      "HF_TOKEN": "@hf-token"
    }
  }
}`;

  return {
    path: "vercel.json",
    content,
    description: "Vercel deployment configuration",
  };
}

export function generateReadme(projectName: string, features: string[]): TemplateFile {
  const content = `# ${projectName}

Production-ready AI Integration Platform with multiple provider support.

## Features

${features.map((f) => `- ${f}`).join("\n")}

## Quick Start

\`\`\`bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 3. Run development server
npm run dev
\`\`\`

Visit \`http://localhost:3000\`

## Environment Variables

See \`.env.example\` for required variables.

### Required
- \`ANTHROPIC_API_KEY\` - Claude API key
- \`OPENROUTER_API_KEY\` - OpenRouter API key

### Optional
- \`DEEPSEEK_API_KEY\` - DeepSeek models
- \`XAI_API_KEY\` - xAI Grok models
- \`NVIDIA_NIM_API_KEY\` - NVIDIA accelerated inference
- \`HF_TOKEN\` - HuggingFace Inference API

### Database (if using RAG)
- \`NEXT_PUBLIC_SUPABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\`
- \`SUPABASE_SERVICE_ROLE_KEY\`

## Deployment

### Vercel
\`\`\`bash
vercel deploy
\`\`\`

### Docker
\`\`\`bash
docker-compose up -d
\`\`\`

### Kubernetes
\`\`\`bash
kubectl apply -f k8s/
\`\`\`

## Documentation

- [API Reference](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Security Best Practices](./docs/security.md)

## Architecture

This platform uses:
- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **Supabase** for database & auth
- **pgvector** for embeddings

## License

MIT
`;

  return {
    path: "README.md",
    content,
    description: "Project documentation",
  };
}
