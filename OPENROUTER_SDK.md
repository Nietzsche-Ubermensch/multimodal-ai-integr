# OpenRouter TypeScript SDK Integration Guide

## Overview

The OpenRouter TypeScript SDK (`@openrouter/ai-sdk-provider`) is the official SDK for integrating OpenRouter's 100+ AI models into TypeScript and JavaScript applications. It provides seamless integration with the Vercel AI SDK for streaming responses and full type safety.

## Installation

```bash
npm install @openrouter/ai-sdk-provider ai openai
```

## Quick Start

### Basic Text Generation

```typescript
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': 'https://your-site.com',
    'X-Title': 'Your App Name'
  }
});

const { text } = await generateText({
  model: openrouter('anthropic/claude-3-5-sonnet'),
  messages: [
    { role: 'user', content: 'Explain quantum entanglement' }
  ],
  temperature: 0.7
});

console.log(text);
```

### Streaming Responses

```typescript
import { streamText } from 'ai';

const { textStream } = await streamText({
  model: openrouter('openai/gpt-4'),
  messages: [
    { role: 'user', content: 'Write a short story about AI' }
  ]
});

for await (const chunk of textStream) {
  process.stdout.write(chunk);
}
```

## Next.js Integration

### App Router (Recommended)

```typescript
// app/api/chat/route.ts
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!
  });

  const result = await streamText({
    model: openrouter('deepseek/deepseek-chat-v3'),
    messages
  });

  return result.toDataStreamResponse();
}
```

```typescript
// app/page.tsx
'use client';

import { useChat } from 'ai/react';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat'
  });

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          <strong>{m.role}:</strong> {m.content}
        </div>
      ))}
      
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

## Supported Models

### DeepSeek Models
- `deepseek/deepseek-chat-v3` - Latest chat model
- `deepseek/deepseek-r1` - Reasoning model
- `deepseek/deepseek-chat-v3-0324` - Specific version

### Anthropic Claude
- `anthropic/claude-3-5-sonnet` - Most capable
- `anthropic/claude-3-opus` - Balanced
- `anthropic/claude-3-haiku` - Fastest

### OpenAI GPT
- `openai/gpt-4-turbo` - Latest GPT-4
- `openai/gpt-4` - Standard GPT-4
- `openai/gpt-3.5-turbo` - Cost-effective

### xAI Grok
- `x-ai/grok-4` - Full Grok-4
- `x-ai/grok-4-fast` - High-speed variant
- `x-ai/grok-code-fast-1` - Code generation

### Meta Llama
- `meta-llama/llama-3.3-70b-instruct` - Latest Llama
- `meta-llama/llama-3.1-405b-instruct` - Largest

### Microsoft
- `microsoft/phi-4` - Efficient small model
- `microsoft/wizardlm-2-8x22b` - Advanced reasoning

### Google Gemini
- `google/gemini-2.0-flash-exp` - Latest experimental
- `google/gemini-pro` - Production-ready

### NVIDIA
- `nvidia/nemotron-nano-9b-v2` - Edge deployment

## Advanced Features

### Model Fallback Chain

```typescript
const models = [
  'anthropic/claude-3-5-sonnet',
  'openai/gpt-4-turbo',
  'meta-llama/llama-3.3-70b-instruct',
  'deepseek/deepseek-chat-v3'
];

async function chatWithFallback(prompt: string) {
  for (const modelId of models) {
    try {
      const { text } = await generateText({
        model: openrouter(modelId),
        messages: [{ role: 'user', content: prompt }]
      });
      return { text, model: modelId };
    } catch (error) {
      console.error(`Model ${modelId} failed, trying next...`);
    }
  }
  throw new Error('All models failed');
}
```

### Custom Headers

```typescript
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': 'https://myapp.com',
    'X-Title': 'My AI App',
    'X-Description': 'AI-powered chat application'
  }
});
```

### Error Handling

```typescript
try {
  const { text } = await generateText({
    model: openrouter('anthropic/claude-3-5-sonnet'),
    messages: [{ role: 'user', content: prompt }]
  });
  console.log(text);
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('401')) {
      console.error('Invalid API key');
    } else if (error.message.includes('429')) {
      console.error('Rate limit exceeded');
    } else if (error.message.includes('insufficient_quota')) {
      console.error('Insufficient credits');
    } else {
      console.error('Unexpected error:', error.message);
    }
  }
}
```

## Environment Variables

### Required
```bash
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### Optional
```bash
# For development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# For production
OPENROUTER_DEFAULT_MODEL=anthropic/claude-3-5-sonnet
OPENROUTER_MAX_RETRIES=3
```

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Add environment variable
vercel env add OPENROUTER_API_KEY

# Deploy
vercel deploy --prod
```

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

ENV OPENROUTER_API_KEY=
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t my-ai-app .
docker run -p 3000:3000 -e OPENROUTER_API_KEY=$OPENROUTER_API_KEY my-ai-app
```

### AWS Lambda (Serverless Framework)

```yaml
# serverless.yml
service: openrouter-ai-app

provider:
  name: aws
  runtime: nodejs20.x
  environment:
    OPENROUTER_API_KEY: ${env:OPENROUTER_API_KEY}

functions:
  chat:
    handler: handler.chat
    events:
      - httpApi:
          path: /chat
          method: post
```

```typescript
// handler.ts
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

export async function chat(event: any) {
  const { prompt } = JSON.parse(event.body);
  
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!
  });

  const { text } = await generateText({
    model: openrouter('deepseek/deepseek-chat-v3'),
    messages: [{ role: 'user', content: prompt }]
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ response: text })
  };
}
```

## Testing

### Live SDK Test

This platform includes a **live testing interface** for the OpenRouter TypeScript SDK:

1. Navigate to the "GitHub Repository Integration" slide
2. Click "Show SDK Test"
3. Enter your OpenRouter API key
4. Click "Test SDK Integration"
5. View the live response and latency

### Unit Testing

```typescript
// __tests__/openrouter.test.ts
import { testOpenRouterSDK } from '@/lib/openrouter-sdk';

describe('OpenRouter SDK', () => {
  it('should successfully call the API', async () => {
    const result = await testOpenRouterSDK(
      process.env.OPENROUTER_API_KEY!,
      'openai/gpt-3.5-turbo'
    );
    
    expect(result.success).toBe(true);
    expect(result.response).toBeDefined();
    expect(result.latency).toBeGreaterThan(0);
  });
});
```

## Best Practices

### 1. Use Environment Variables
Never hardcode API keys in your source code.

```typescript
// ❌ Bad
const apiKey = "sk-or-v1-...";

// ✅ Good
const apiKey = process.env.OPENROUTER_API_KEY;
```

### 2. Implement Rate Limiting
Protect your application from excessive API calls.

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/chat', limiter);
```

### 3. Cache Responses
Reduce costs and latency by caching common queries.

```typescript
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

async function getCachedResponse(prompt: string) {
  const cached = await redis.get(`chat:${prompt}`);
  if (cached) return cached;
  
  const { text } = await generateText({
    model: openrouter('deepseek/deepseek-chat-v3'),
    messages: [{ role: 'user', content: prompt }]
  });
  
  await redis.setex(`chat:${prompt}`, 3600, text);
  return text;
}
```

### 4. Monitor Usage
Track token usage and costs.

```typescript
const result = await generateText({
  model: openrouter('anthropic/claude-3-5-sonnet'),
  messages
});

console.log('Token usage:', {
  prompt: result.usage?.promptTokens,
  completion: result.usage?.completionTokens,
  total: result.usage?.totalTokens
});
```

### 5. Implement Retry Logic
Handle transient errors gracefully.

```typescript
async function retryableGenerate(prompt: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateText({
        model: openrouter('deepseek/deepseek-chat-v3'),
        messages: [{ role: 'user', content: prompt }]
      });
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

## Resources

- **GitHub Repository**: https://github.com/OpenRouterTeam/typescript-sdk
- **OpenRouter Dashboard**: https://openrouter.ai/keys
- **API Documentation**: https://openrouter.ai/docs
- **Vercel AI SDK**: https://sdk.vercel.ai/docs
- **Model Pricing**: https://openrouter.ai/models

## Support

- GitHub Issues: https://github.com/OpenRouterTeam/typescript-sdk/issues
- Discord: https://discord.gg/openrouter
- Documentation: https://openrouter.ai/docs

## License

MIT License - See the repository for details.
