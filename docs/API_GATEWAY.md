# Node.js API Gateway - Implementation Guide

## Overview

Production-ready Node.js API Gateway providing unified access to multiple AI providers with:
- **Provider Routing**: Intelligent request routing to Anthropic, DeepSeek, xAI, OpenRouter, LiteLLM, Nvidia NIM, Perplexity, HuggingFace
- **Authentication**: JWT-based auth with API key management and rate limiting
- **Security**: CORS, request validation, secret management, audit logging
- **Monitoring**: Health checks, metrics, request tracing
- **Scalability**: Load balancing, caching, circuit breakers

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Applications                      │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway (Express.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Auth         │  │ Rate Limit   │  │ Validation   │          │
│  │ Middleware   │  │ Middleware   │  │ Middleware   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Router Layer                                │  │
│  │  /api/v1/chat  /api/v1/embeddings  /api/v1/rerank      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Provider Adapters                           │  │
│  │  Anthropic│DeepSeek│xAI│OpenRouter│LiteLLM│Nvidia│etc  │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External AI Providers                         │
│  Anthropic  DeepSeek  xAI  OpenRouter  HuggingFace  Nvidia      │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Installation

```bash
cd api-gateway
npm install
```

### Environment Configuration

Create `.env` file:

```bash
# Server Configuration
NODE_ENV=development
PORT=3001
API_BASE_URL=http://localhost:3001

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=24h

# Rate Limiting (Redis)
REDIS_URL=redis://localhost:6379
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100

# AI Provider API Keys
ANTHROPIC_API_KEY=sk-ant-...
DEEPSEEK_API_KEY=sk-...
XAI_API_KEY=xai-...
OPENROUTER_API_KEY=sk-or-...
LITELLM_API_KEY=sk-...
NVIDIA_NIM_API_KEY=nvapi-...
PERPLEXITY_API_KEY=pplx-...
HF_TOKEN=hf_...

# Database (Optional - for API key management)
DATABASE_URL=postgresql://user:pass@localhost:5432/gateway

# Monitoring
ENABLE_METRICS=true
LOG_LEVEL=info
```

### Start Development Server

```bash
npm run dev
```

### Production Deployment

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}

Response: 201 Created
{
  "user": {
    "id": "usr_123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "24h"
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Authorization: Bearer <token>

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Chat Completion

#### Unified Chat Endpoint
```http
POST /api/v1/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "provider": "anthropic",
  "model": "claude-3-5-sonnet-20241022",
  "messages": [
    {
      "role": "user",
      "content": "Explain quantum computing"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000,
  "stream": false
}

Response: 200 OK
{
  "id": "msg_123",
  "provider": "anthropic",
  "model": "claude-3-5-sonnet-20241022",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Quantum computing..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 250,
    "total_tokens": 265
  }
}
```

#### Streaming Chat
```http
POST /api/v1/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "provider": "openrouter",
  "model": "anthropic/claude-3-5-sonnet",
  "messages": [...],
  "stream": true
}

Response: 200 OK (Server-Sent Events)
data: {"delta": {"content": "Quantum"}}
data: {"delta": {"content": " computing"}}
...
data: [DONE]
```

### Embeddings

```http
POST /api/v1/embeddings
Authorization: Bearer <token>
Content-Type: application/json

{
  "provider": "huggingface",
  "model": "BAAI/bge-large-en-v1.5",
  "input": "The quick brown fox jumps over the lazy dog"
}

Response: 200 OK
{
  "embeddings": [0.023, -0.015, 0.042, ...],
  "model": "BAAI/bge-large-en-v1.5",
  "usage": {
    "total_tokens": 10
  }
}
```

### Reranking

```http
POST /api/v1/rerank
Authorization: Bearer <token>
Content-Type: application/json

{
  "provider": "nvidia_nim",
  "model": "nvidia/llama-3_2-nv-rerankqa-1b-v2",
  "query": "What is machine learning?",
  "documents": [
    "Machine learning is a subset of AI...",
    "Deep learning uses neural networks...",
    "Supervised learning requires labeled data..."
  ],
  "top_n": 2
}

Response: 200 OK
{
  "results": [
    {
      "index": 0,
      "relevance_score": 0.95,
      "document": "Machine learning is a subset of AI..."
    },
    {
      "index": 2,
      "relevance_score": 0.78,
      "document": "Supervised learning requires labeled data..."
    }
  ]
}
```

### Provider Management

#### List Available Providers
```http
GET /api/v1/providers
Authorization: Bearer <token>

Response: 200 OK
{
  "providers": [
    {
      "id": "anthropic",
      "name": "Anthropic",
      "status": "active",
      "models": ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229"],
      "capabilities": ["chat", "vision"]
    },
    {
      "id": "openrouter",
      "name": "OpenRouter",
      "status": "active",
      "models": ["anthropic/claude-3-5-sonnet", "google/gemini-2.0-flash-exp"],
      "capabilities": ["chat", "vision", "function-calling"]
    }
  ]
}
```

#### Health Check
```http
GET /api/v1/health
Authorization: Bearer <token>

Response: 200 OK
{
  "status": "healthy",
  "providers": {
    "anthropic": "online",
    "deepseek": "online",
    "xai": "online",
    "openrouter": "online",
    "nvidia_nim": "degraded",
    "huggingface": "online"
  },
  "database": "connected",
  "redis": "connected"
}
```

### API Key Management

#### Add Provider API Key
```http
POST /api/v1/keys
Authorization: Bearer <token>
Content-Type: application/json

{
  "provider": "anthropic",
  "apiKey": "sk-ant-...",
  "name": "Production Anthropic Key"
}

Response: 201 Created
{
  "id": "key_123",
  "provider": "anthropic",
  "name": "Production Anthropic Key",
  "maskedKey": "sk-ant-...xyz"
}
```

#### Validate API Key
```http
POST /api/v1/keys/validate
Authorization: Bearer <token>
Content-Type: application/json

{
  "provider": "deepseek",
  "apiKey": "sk-..."
}

Response: 200 OK
{
  "valid": true,
  "provider": "deepseek",
  "details": {
    "hasAccess": true,
    "models": ["deepseek-chat", "deepseek-coder"]
  }
}
```

## Provider-Specific Configuration

### Anthropic
```javascript
{
  "provider": "anthropic",
  "model": "claude-3-5-sonnet-20241022",
  "anthropic_version": "2023-06-01",
  "max_tokens": 4096,
  "temperature": 0.7
}
```

### DeepSeek
```javascript
{
  "provider": "deepseek",
  "model": "deepseek-chat",
  "temperature": 0.7,
  "top_p": 0.95,
  "frequency_penalty": 0.0
}
```

### xAI (Grok)
```javascript
{
  "provider": "xai",
  "model": "grok-4-1-fast-reasoning",
  "reasoning_effort": "high",
  "temperature": 0.7
}
```

### OpenRouter
```javascript
{
  "provider": "openrouter",
  "model": "anthropic/claude-3-5-sonnet",
  "site_url": "https://yourapp.com",
  "app_name": "YourApp",
  "transforms": ["middle-out"]
}
```

### LiteLLM
```javascript
{
  "provider": "litellm",
  "model": "gpt-4o",
  "fallback_models": ["gpt-4o-mini", "claude-3-5-sonnet"],
  "cache": true
}
```

### Nvidia NIM
```javascript
{
  "provider": "nvidia_nim",
  "model": "nvidia/llama-3.3-70b-instruct",
  "temperature": 0.7,
  "top_p": 0.9
}
```

### Perplexity
```javascript
{
  "provider": "perplexity",
  "model": "sonar-pro",
  "reasoning_effort": "medium"
}
```

### HuggingFace
```javascript
{
  "provider": "huggingface",
  "model": "together/deepseek-ai/DeepSeek-R1",
  "use_cache": false
}
```

## Security Features

### Rate Limiting

Default limits per user:
- 100 requests per 15 minutes (general endpoints)
- 10 requests per minute (authentication endpoints)
- 1000 requests per hour (paid tier)

Custom limits can be configured per user or API key.

### Request Validation

All requests are validated against JSON schemas:
- Required fields check
- Type validation
- Range validation (e.g., temperature 0-2)
- Model availability check

### API Key Encryption

User-provided API keys are encrypted at rest using AES-256-GCM.

### Audit Logging

All requests are logged with:
- User ID
- Provider
- Model
- Token usage
- Response time
- Success/error status

## Monitoring & Metrics

### Prometheus Metrics

Available at `/metrics`:

```
# Request count by provider
gateway_requests_total{provider="anthropic",status="success"} 1234

# Request duration
gateway_request_duration_seconds{provider="anthropic",quantile="0.95"} 0.45

# Token usage
gateway_tokens_total{provider="anthropic",type="prompt"} 45678

# Error rate
gateway_errors_total{provider="anthropic",error_type="rate_limit"} 5
```

### Health Checks

- Liveness: `/health/live` - Gateway is running
- Readiness: `/health/ready` - Gateway is ready to serve traffic
- Detailed: `/api/v1/health` - Provider status, DB, Redis connectivity

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "type": "validation_error",
    "message": "Invalid model specified",
    "details": {
      "provider": "anthropic",
      "model": "invalid-model",
      "available_models": ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229"]
    },
    "trace_id": "req_abc123"
  }
}
```

### Error Types

- `authentication_error`: Invalid or missing token
- `authorization_error`: Insufficient permissions
- `validation_error`: Invalid request format
- `rate_limit_error`: Too many requests
- `provider_error`: External provider failure
- `internal_error`: Gateway internal error

## Development

### Project Structure

```
api-gateway/
├── src/
│   ├── index.ts                 # Entry point
│   ├── config/
│   │   ├── env.ts              # Environment config
│   │   └── providers.ts        # Provider configurations
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication
│   │   ├── rateLimit.ts        # Rate limiting
│   │   ├── validation.ts       # Request validation
│   │   └── errorHandler.ts    # Global error handling
│   ├── routes/
│   │   ├── auth.ts             # Auth routes
│   │   ├── chat.ts             # Chat routes
│   │   ├── embeddings.ts       # Embeddings routes
│   │   ├── rerank.ts           # Rerank routes
│   │   └── providers.ts        # Provider management
│   ├── services/
│   │   ├── providers/
│   │   │   ├── anthropic.ts
│   │   │   ├── deepseek.ts
│   │   │   ├── xai.ts
│   │   │   ├── openrouter.ts
│   │   │   ├── litellm.ts
│   │   │   ├── nvidia.ts
│   │   │   ├── perplexity.ts
│   │   │   └── huggingface.ts
│   │   ├── auth.ts             # Auth service
│   │   └── keys.ts             # API key management
│   ├── models/
│   │   ├── User.ts
│   │   ├── ApiKey.ts
│   │   └── Request.ts
│   └── utils/
│       ├── logger.ts           # Structured logging
│       ├── metrics.ts          # Prometheus metrics
│       └── encryption.ts       # Key encryption
├── tests/
│   ├── integration/
│   └── unit/
├── package.json
├── tsconfig.json
└── .env.example
```

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage
npm run test:coverage
```

### Local Development with Docker

```bash
docker-compose up -d
```

Includes:
- Gateway service
- PostgreSQL database
- Redis cache
- Prometheus monitoring
- Grafana dashboards

## Deployment

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: your-registry/api-gateway:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: gateway-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: gateway-secrets
              key: jwt-secret
```

## Performance Optimization

### Caching Strategy

- Provider model lists cached for 1 hour
- User permissions cached for 5 minutes
- Response caching for deterministic requests (temperature=0)

### Connection Pooling

- Database: 20 connections max
- Redis: 10 connections max
- HTTP clients: Keep-alive enabled

### Load Balancing

Multiple gateway instances behind load balancer (Nginx/HAProxy/AWS ALB).

## License

MIT License - See LICENSE file for details
