# OpenRouter TypeScript SDK - Complete Integration Guide

## Overview

This project includes full integration of the OpenRouter TypeScript SDK, providing seamless access to 100+ AI models through a unified, type-safe API. The integration includes interactive demonstrations, real API testing, and production-ready code examples.

## What's Been Integrated

### 1. **OpenRouter SDK Library** (`src/lib/openrouter-sdk.ts`)
- TypeScript wrapper around `@openrouter/ai-sdk-provider`
- Support for both standard and streaming chat completions
- Model listing and availability checking
- Built-in error handling and type safety

### 2. **Interactive SDK Demo Component** (`src/components/OpenRouterSDKDemo.tsx`)
- Clone instructions with git commands
- NPM installation guide
- Live SDK testing with real API keys
- Code examples for:
  - Quick start (basic text generation)
  - Streaming responses
  - Multi-provider routing
  - Error handling patterns
- Interactive demo with simulated/real API toggle
- Copy-to-clipboard functionality for all code snippets

### 3. **New Presentation Slide**
- Added "OpenRouter TypeScript SDK Integration" slide
- Interactive demonstration of SDK capabilities
- Step-by-step integration guide
- Live API testing interface

## Repository Cloning Instructions

To clone and integrate the OpenRouter TypeScript SDK repository:

```bash
# Clone the official OpenRouter TypeScript SDK
git clone https://github.com/OpenRouterTeam/typescript-sdk.git

# Navigate to the directory
cd typescript-sdk

# Install dependencies
npm install

# Build the SDK
npm run build

# Run tests to verify installation
npm test
```

## Installation

The SDK is already installed in this project via npm:

```bash
npm install @openrouter/ai-sdk-provider ai
```

Dependencies installed:
- `@openrouter/ai-sdk-provider` - Official OpenRouter SDK
- `ai` - Vercel AI SDK (required peer dependency)

## Usage Examples

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
    { role: 'user', content: 'Explain quantum computing' }
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
    { role: 'user', content: 'Write a story about AI' }
  ]
});

for await (const chunk of textStream) {
  process.stdout.write(chunk);
}
```

### Using the SDK Wrapper Class

```typescript
import { OpenRouterSDK } from '@/lib/openrouter-sdk';

const sdk = new OpenRouterSDK({
  apiKey: process.env.OPENROUTER_API_KEY
});

// Standard chat completion
const response = await sdk.chat({
  model: 'anthropic/claude-3-5-sonnet',
  messages: [{ role: 'user', content: 'Hello!' }],
  temperature: 0.7
});

// Streaming with callbacks
await sdk.streamChat({
  model: 'openai/gpt-4',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  onChunk: (chunk) => console.log(chunk),
  onComplete: (fullText) => console.log('Done:', fullText),
  onError: (error) => console.error('Error:', error)
});

// List available models
const models = await sdk.listModels();
console.log(models);
```

## Interactive Features

### SDK Demo Component

The OpenRouterSDKDemo component provides:

1. **Repository Cloning Guide**
   - Git clone commands
   - Installation steps
   - Build and test instructions

2. **Installation Instructions**
   - NPM/PNPM/Yarn commands
   - Dependency explanations

3. **Code Examples Tabs**
   - Quick Start
   - Streaming
   - Multi-Provider Routing
   - Error Handling
   - Each with copy-to-clipboard

4. **Live SDK Testing**
   - Enter your API key
   - Select from 5 popular models
   - Test SDK connection
   - View response and latency

5. **Interactive Demo**
   - Toggle between simulated and real API calls
   - Custom prompt input
   - See formatted responses
   - Model selection dropdown

## Available Models (Demo)

The demo includes these popular models:

- `openai/gpt-3.5-turbo` - GPT-3.5 Turbo (OpenAI)
- `anthropic/claude-3-5-sonnet` - Claude 3.5 Sonnet (Anthropic)
- `deepseek/deepseek-chat` - DeepSeek Chat (DeepSeek)
- `x-ai/grok-beta` - Grok Beta (xAI)
- `google/gemini-pro` - Gemini Pro (Google)

For a complete list of 100+ available models, visit: https://openrouter.ai/models

## Environment Variables

Add to your `.env` file:

```bash
# OpenRouter API Key (required)
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

Get your API key from: https://openrouter.ai/keys

## Security Best Practices

1. **Never expose API keys on the frontend**
   - Use environment variables
   - Implement server-side API proxy
   - Store keys securely

2. **API Key Storage**
   - Use the `useKV` hook for persistent storage in demos
   - Keys are stored locally in browser
   - Never commit keys to version control

3. **Rate Limiting**
   - Implement client-side rate limiting
   - Handle 429 errors gracefully
   - Use exponential backoff

## Error Handling

The SDK wrapper includes comprehensive error handling:

```typescript
try {
  const sdk = new OpenRouterSDK({
    apiKey: process.env.OPENROUTER_API_KEY
  });

  const response = await sdk.chat({
    model: 'anthropic/claude-3-5-sonnet',
    messages: [{ role: 'user', content: 'Hello' }],
    temperature: 0.7
  });

  console.log(response);
} catch (error) {
  if (error.message.includes('401')) {
    console.error('Invalid API key');
  } else if (error.message.includes('429')) {
    console.error('Rate limit exceeded');
  } else {
    console.error('Error:', error.message);
  }
}
```

## Testing the SDK

The project includes a test function:

```typescript
import { testOpenRouterSDK } from '@/lib/openrouter-sdk';

const result = await testOpenRouterSDK(
  'your-api-key',
  'openai/gpt-3.5-turbo'
);

console.log(result);
// {
//   success: true,
//   response: "Hello from OpenRouter SDK!",
//   latency: 1234
// }
```

## Multi-Provider Routing

Switch between models seamlessly:

```typescript
const models = {
  fast: openrouter('openai/gpt-3.5-turbo'),
  smart: openrouter('anthropic/claude-3-5-sonnet'),
  reasoning: openrouter('deepseek/deepseek-r1'),
  code: openrouter('x-ai/grok-code-fast-1')
};

// Use different models for different tasks
const quickResponse = await generateText({
  model: models.fast,
  messages: [{ role: 'user', content: 'Quick summary' }]
});

const deepAnalysis = await generateText({
  model: models.smart,
  messages: [{ role: 'user', content: 'Detailed analysis' }]
});
```

## Presentation Integration

Access the OpenRouter SDK demo in the presentation:

1. Navigate to slide "OpenRouter TypeScript SDK Integration"
2. View repository cloning instructions
3. Review installation steps
4. Test SDK with your API key
5. Explore code examples in different tabs
6. Try the interactive demo

## Resources

- **GitHub Repository**: https://github.com/OpenRouterTeam/typescript-sdk
- **OpenRouter Docs**: https://openrouter.ai/docs
- **Model Directory**: https://openrouter.ai/models
- **API Keys**: https://openrouter.ai/keys
- **Vercel AI SDK**: https://sdk.vercel.ai/docs

## Next Steps

1. Get your OpenRouter API key from https://openrouter.ai/keys
2. Add it to your `.env` file
3. Navigate to the SDK demo slide in the presentation
4. Test the SDK with the interactive demo
5. Copy code examples to your project
6. Start building with 100+ AI models!

## Support

For issues or questions:
- OpenRouter Discord: https://discord.gg/openrouter
- GitHub Issues: https://github.com/OpenRouterTeam/typescript-sdk/issues
- Documentation: https://openrouter.ai/docs
