# Real API Integration for Live Model Testing

## Overview

ModelHub now includes **real API integration** for live model testing with actual streaming responses from multiple AI providers. This enables developers to test AI models directly in the browser while understanding the security implications and best practices for production deployment.

## Supported Providers

### 1. **OpenAI**
- **Models**: gpt-4o, gpt-4o-mini, gpt-3.5-turbo
- **Base URL**: `https://api.openai.com/v1`
- **Env Var**: `OPENAI_API_KEY`
- **Use Cases**: General-purpose text generation, chat, code completion

### 2. **Anthropic**
- **Models**: claude-3-5-sonnet-20240620, claude-3-haiku-20240307
- **Base URL**: `https://api.anthropic.com/v1`
- **Env Var**: `ANTHROPIC_API_KEY`
- **Use Cases**: Advanced reasoning, analysis, long-context tasks

### 3. **OpenRouter**
- **Models**: meta-llama/llama-3.2-3b-instruct:free, google/gemini-flash-1.5, anthropic/claude-3-haiku
- **Base URL**: `https://openrouter.ai/api/v1`
- **Env Var**: `OPENROUTER_API_KEY`
- **Use Cases**: Unified access to 100+ models with single API key

### 4. **Perplexity**
- **Models**: sonar, sonar-pro
- **Base URL**: `https://api.perplexity.ai`
- **Env Var**: `PERPLEXITYAI_API_KEY`
- **Use Cases**: Real-time web search with citations

### 5. **DeepSeek**
- **Models**: deepseek-chat, deepseek-reasoner
- **Base URL**: `https://api.deepseek.com`
- **Env Var**: `DEEPSEEK_API_KEY`
- **Use Cases**: Advanced reasoning, mathematical problem solving

### 6. **xAI**
- **Models**: grok-beta, grok-vision-beta
- **Base URL**: `https://api.x.ai/v1`
- **Env Var**: `XAI_API_KEY`
- **Use Cases**: Real-time data access, vision capabilities

## Architecture

### API Client (`src/lib/api-client.ts`)

The `ModelApiClient` class provides a unified interface for all providers using the OpenAI SDK:

```typescript
import OpenAI from 'openai';

export class ModelApiClient {
  private clients: Map<string, OpenAI> = new Map();

  // Get provider-specific base URL
  private getBaseURL(provider: string): string {
    const urls: Record<string, string> = {
      openai: 'https://api.openai.com/v1',
      anthropic: 'https://api.anthropic.com/v1',
      openrouter: 'https://openrouter.ai/api/v1',
      // ... more providers
    };
    return urls[provider] || '';
  }

  // Create OpenAI client for each provider
  private getClient(provider: string, apiKey: string): OpenAI {
    return new OpenAI({
      apiKey,
      baseURL: this.getBaseURL(provider),
      dangerouslyAllowBrowser: true, // DEMO ONLY!
    });
  }

  // Streaming chat completion
  async *streamChatCompletion(
    config: ApiConfig,
    params: ChatCompletionParams
  ): AsyncGenerator<string, void, unknown> {
    const client = this.getClient(config.provider, config.apiKey);
    
    const stream = await client.chat.completions.create({
      model: params.model,
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 1000,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) yield content;
    }
  }
}
```

### Live Model Tester Component (`src/components/LiveModelTester.tsx`)

The React component provides an interactive UI for testing:

```typescript
export function LiveModelTester() {
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [useRealApi, setUseRealApi] = useState(false);
  const [enableStreaming, setEnableStreaming] = useState(true);

  const handleRealApiCall = async () => {
    const stream = apiClient.streamChatCompletion(
      { provider: selectedProvider, apiKey },
      { model: selectedModel, messages, temperature, maxTokens }
    );

    for await (const chunk of stream) {
      if (abortRef.current) break;
      setResponse(prev => prev + chunk);
      // Update metrics in real-time
    }
  };
}
```

## Features

### 1. **Real-Time Streaming**
- Token-by-token display using async generators
- Live cursor animation during streaming
- Auto-scroll to latest content
- Stop button to cancel mid-stream

### 2. **Performance Metrics**
- **Latency**: Total time from request to completion (ms)
- **Tokens**: Total tokens generated
- **Tokens/Second**: Real-time throughput measurement
- **Status**: Visual indicators (Ready/Processing/Complete)

### 3. **Parameter Controls**
- **Temperature**: 0.0 to 1.0 (0.05 steps) - Controls randomness
- **Max Tokens**: 100 to 4000 (100 steps) - Limits response length
- **Streaming**: Toggle between streaming and full response
- **Real API**: Switch between simulation and actual API calls

### 4. **Code Generation**
Automatically generates production-ready code:

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Streaming response
const stream = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Your prompt' }],
  temperature: 0.7,
  max_tokens: 1000,
  stream: true
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) process.stdout.write(content);
}
```

## Security Considerations

### ⚠️ Critical Security Warning

The demo uses `dangerouslyAllowBrowser: true` which **exposes API keys in the browser**.

**This is for demonstration purposes only. NEVER use in production.**

### Production Best Practices

#### 1. **Backend Proxy Pattern**

Create a secure backend API that proxies requests:

```typescript
// backend/api/chat.ts
import { OpenAI } from 'openai';

export async function POST(request: Request) {
  // API key stored securely on server
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const { messages, model, temperature } = await request.json();

  // Input validation
  if (!messages || !Array.isArray(messages)) {
    return new Response('Invalid input', { status: 400 });
  }

  // Rate limiting (per user/IP)
  await checkRateLimit(request);

  const stream = await client.chat.completions.create({
    model,
    messages,
    temperature,
    stream: true
  });

  return new Response(stream.toReadableStream());
}
```

#### 2. **Rate Limiting**

Implement per-user rate limiting:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10s'),
});

async function checkRateLimit(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    throw new Error('Rate limit exceeded');
  }
}
```

#### 3. **Input Validation**

Sanitize and validate all inputs:

```typescript
import { z } from 'zod';

const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1).max(4000)
  })).max(50),
  model: z.enum(['gpt-4o', 'claude-3-5-sonnet-20240620']),
  temperature: z.number().min(0).max(1).default(0.7),
  maxTokens: z.number().min(1).max(4000).default(1000)
});

const validatedData = chatRequestSchema.parse(requestData);
```

#### 4. **Environment Variables**

Store API keys securely:

```bash
# .env (never commit to git)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-v1-...
```

```typescript
// Load with proper validation
import { z } from 'zod';

const envSchema = z.object({
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),
});

const env = envSchema.parse(process.env);
```

#### 5. **Monitoring & Logging**

Track usage and costs:

```typescript
async function logApiCall({
  userId,
  provider,
  model,
  tokens,
  latency,
  cost
}: ApiCallLog) {
  await db.insert('api_logs', {
    userId,
    provider,
    model,
    tokens,
    latency,
    cost,
    timestamp: new Date()
  });
}
```

## Usage Examples

### Example 1: Simple Chat

```typescript
import { apiClient } from '@/lib/api-client';

const response = await apiClient.chatCompletion(
  {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY!
  },
  {
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Hello!' }],
    temperature: 0.7,
    maxTokens: 100
  }
);

console.log(response.choices[0].message.content);
```

### Example 2: Streaming with Metrics

```typescript
const startTime = Date.now();
let tokenCount = 0;

const stream = apiClient.streamChatCompletion(
  { provider: 'anthropic', apiKey: process.env.ANTHROPIC_API_KEY! },
  {
    model: 'claude-3-5-sonnet-20240620',
    messages: [{ role: 'user', content: 'Explain quantum computing' }],
    temperature: 0.5,
    maxTokens: 1000
  }
);

for await (const chunk of stream) {
  process.stdout.write(chunk);
  tokenCount++;
  
  const elapsed = (Date.now() - startTime) / 1000;
  const tokensPerSecond = tokenCount / elapsed;
  
  console.log(`\nTokens: ${tokenCount}, Speed: ${tokensPerSecond.toFixed(1)} t/s`);
}
```

### Example 3: Provider Comparison

```typescript
async function compareProviders(prompt: string) {
  const providers = [
    { id: 'openai', model: 'gpt-4o' },
    { id: 'anthropic', model: 'claude-3-5-sonnet-20240620' },
    { id: 'openrouter', model: 'meta-llama/llama-3.2-3b-instruct:free' }
  ];

  const results = await Promise.all(
    providers.map(async ({ id, model }) => {
      const startTime = Date.now();
      
      const response = await apiClient.chatCompletion(
        { provider: id, apiKey: process.env[`${id.toUpperCase()}_API_KEY`]! },
        { model, messages: [{ role: 'user', content: prompt }] }
      );

      return {
        provider: id,
        model,
        response: response.choices[0].message.content,
        latency: Date.now() - startTime,
        tokens: response.usage?.completion_tokens || 0
      };
    })
  );

  return results;
}
```

## Testing

### Simulation Mode

For development and testing without API keys:

1. Toggle "Real API Mode" OFF
2. Enter any prompt
3. Click "Simulate Response"
4. See provider-specific mock responses

### Real API Mode

For testing actual API integration:

1. Enter your API key for the selected provider
2. Toggle "Real API Mode" ON
3. Enter your prompt
4. Click "Test Real API"
5. Monitor real-time streaming response and metrics

## Deployment

### Vercel

1. Set environment variables in Vercel dashboard:
   ```
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   ```

2. Deploy with Edge Runtime for streaming:
   ```typescript
   export const runtime = 'edge';
   ```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t modelhub .
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=sk-... \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  modelhub
```

## Cost Optimization

### 1. **Caching**

Cache common responses:

```typescript
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, string>({
  max: 1000,
  ttl: 1000 * 60 * 60, // 1 hour
});

const cacheKey = `${model}:${JSON.stringify(messages)}`;
const cached = cache.get(cacheKey);

if (cached) return cached;

const response = await apiClient.chatCompletion(...);
cache.set(cacheKey, response.choices[0].message.content);
```

### 2. **Model Selection**

Use cheaper models for simple tasks:

- **Simple Q&A**: gpt-3.5-turbo, claude-3-haiku
- **Complex reasoning**: gpt-4o, claude-3-5-sonnet
- **Code generation**: deepseek-coder, gpt-4o

### 3. **Token Limits**

Set appropriate `maxTokens` to avoid unnecessary costs:

```typescript
const limits = {
  'simple-qa': 100,
  'explanation': 500,
  'long-form': 2000
};

const maxTokens = limits[taskType] || 1000;
```

## Troubleshooting

### Common Issues

#### Issue: "API key invalid"
**Solution**: Verify API key format and provider:
- OpenAI: Starts with `sk-`
- Anthropic: Starts with `sk-ant-`
- OpenRouter: Starts with `sk-or-v1-`

#### Issue: "Rate limit exceeded"
**Solution**: Implement exponential backoff:

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
  throw new Error('Max retries exceeded');
}
```

#### Issue: "CORS error"
**Solution**: Use backend proxy instead of browser calls

#### Issue: "Streaming not working"
**Solution**: Ensure streaming is enabled:

```typescript
const stream = await client.chat.completions.create({
  // ... other params
  stream: true  // Must be true
});
```

## Next Steps

1. **Review Security**: Understand the security implications before using in production
2. **Test Providers**: Try different providers to find the best fit for your use case
3. **Implement Backend**: Create a secure backend proxy for production use
4. **Monitor Costs**: Track token usage and costs across providers
5. **Optimize Performance**: Implement caching and rate limiting

## Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Security Best Practices](./SECURITY.md)
- [API Gateway Implementation](./api-gateway/README.md)

## Support

For issues or questions:
- Check the [troubleshooting section](#troubleshooting)
- Review the [security guidelines](./SECURITY.md)
- See the [API Gateway documentation](./api-gateway/README.md)
