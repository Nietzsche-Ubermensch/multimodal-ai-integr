# AI Integration Gateway - Node.js API

Production-ready API Gateway for unified access to multiple AI providers.

## Quick Start

### 1. Install Dependencies

```bash
cd api-gateway
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
JWT_SECRET=your-secret-key-min-32-chars
ANTHROPIC_API_KEY=sk-ant-...
DEEPSEEK_API_KEY=sk-...
XAI_API_KEY=xai-...
OPENROUTER_API_KEY=sk-or-...
# ... other keys
```

### 3. Run Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3001`

## API Usage Examples

### 1. Register & Login

```bash
# Register
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Save the token from response
export TOKEN="eyJhbGci..."
```

### 2. Chat with Anthropic

```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "anthropic",
    "model": "claude-3-5-sonnet-20241022",
    "messages": [
      {
        "role": "user",
        "content": "Explain quantum computing in simple terms"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 1000
  }'
```

### 3. Chat with DeepSeek

```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "deepseek",
    "model": "deepseek-chat",
    "messages": [
      {
        "role": "user",
        "content": "Write a Python function to calculate fibonacci numbers"
      }
    ]
  }'
```

### 4. List Providers

```bash
curl -X GET http://localhost:3001/api/v1/providers \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Health Check

```bash
curl http://localhost:3001/api/v1/health
```

## Frontend Integration

### React/TypeScript Example

```typescript
const API_BASE = 'http://localhost:3001/api/v1';
let authToken = '';

// Login
async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  authToken = data.token;
  return data;
}

// Chat completion
async function chat(provider: string, model: string, messages: any[]) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      provider,
      model,
      messages,
      temperature: 0.7,
    }),
  });
  
  return response.json();
}

// Usage
await login('test@example.com', 'password123');

const result = await chat('anthropic', 'claude-3-5-sonnet-20241022', [
  { role: 'user', content: 'Hello!' }
]);

console.log(result.choices[0].message.content);
```

### Streaming Example

```typescript
async function streamChat(provider: string, model: string, messages: any[]) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      provider,
      model,
      messages,
      stream: true,
    }),
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        
        const parsed = JSON.parse(data);
        console.log(parsed.delta.content);
      }
    }
  }
}
```

## Supported Providers

| Provider | Chat | Streaming | Vision | Function Calling |
|----------|------|-----------|--------|------------------|
| Anthropic | ✅ | ✅ | ✅ | ✅ |
| DeepSeek | ✅ | ✅ | ❌ | ✅ |
| xAI | ✅ | 🚧 | ✅ | ✅ |
| OpenRouter | ✅ | 🚧 | ✅ | ✅ |
| Nvidia NIM | ✅ | 🚧 | ❌ | ✅ |
| Perplexity | 🚧 | 🚧 | ❌ | ❌ |
| HuggingFace | 🚧 | 🚧 | ❌ | ❌ |

✅ = Implemented | 🚧 = Coming Soon | ❌ = Not Supported

## Scripts

```bash
npm run dev          # Development server with hot reload
npm run build        # Build for production
npm start            # Run production build
npm test             # Run tests
npm run lint         # Lint code
npm run format       # Format code
```

## Project Structure

```
api-gateway/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── config/
│   │   ├── env.ts              # Environment configuration
│   │   └── providers.ts        # Provider definitions
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication
│   │   ├── rateLimit.ts        # Rate limiting
│   │   ├── validation.ts       # Request validation
│   │   └── errorHandler.ts    # Error handling
│   ├── routes/
│   │   ├── auth.ts             # Auth endpoints
│   │   ├── chat.ts             # Chat endpoints
│   │   ├── embeddings.ts       # Embeddings endpoints
│   │   ├── rerank.ts           # Rerank endpoints
│   │   ├── providers.ts        # Provider management
│   │   └── health.ts           # Health checks
│   ├── services/
│   │   └── providers/
│   │       ├── anthropic.ts
│   │       ├── deepseek.ts
│   │       ├── xai.ts
│   │       ├── openrouter.ts
│   │       └── nvidia.ts
│   └── utils/
│       └── logger.ts           # Logging utility
├── package.json
├── tsconfig.json
└── .env.example
```

## Security Features

- JWT authentication with expiry
- Rate limiting (Redis-based)
- Request validation using Zod
- CORS protection
- Helmet security headers
- API key encryption at rest
- Audit logging

## Environment Variables

See `.env.example` for all available variables.

Required:
- `JWT_SECRET` - Minimum 32 characters
- `ENCRYPTION_KEY` - Exactly 32 characters

At least one provider API key is required for functionality.

## License

MIT
