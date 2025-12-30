# GitHub Copilot Instructions for @Nietzsche-Ubermenschs/multimodal-ai-integr

## Project Overview

**AI Integration Platform** - A comprehensive, production-ready TypeScript platform that unifies testing, comparison, and integration of 70+ AI models from 7+ providers (OpenRouter, Anthropic, DeepSeek, xAI, OpenAI, HuggingFace, NVIDIA NIM) with real API integration, live model testing, streaming responses, RAG pipelines, and Supabase vector storage.

### Core Capabilities
- **Unified Model Catalog**: 70+ models across chat, reasoning, code generation, vision, embeddings, and reranking
- **Live API Testing**: Real-time validation, streaming chat responses, and side-by-side model comparison
- **RAG Pipelines**: Document chunking, embedding generation, vector search with Supabase pgvector
- **API Gateway**: Express-based proxy for secure API key management and rate limiting
- **Web Scraping**: Unified scraping layer with multiple providers (Firecrawl, Oxylabs)
- **Secure Key Management**: Browser-only encrypted storage with real-time validation

## Tech Stack

### Primary Technologies
- **Language**: TypeScript (98.2%) - ES2020 target, strict null checks enabled
- **Frontend**: React 19 with TypeScript, React Hooks (useState, useEffect, custom hooks)
- **UI Framework**: Radix UI primitives via shadcn/ui v4
- **Styling**: Tailwind CSS v4 with custom theme (`oklch` color space)
- **Icons**: Phosphor Icons (@phosphor-icons/react)
- **Build Tool**: Vite 7 with React SWC plugin
- **Package Manager**: npm with workspaces support
- **Backend**: Express.js (api-gateway)
- **Database**: Supabase with pgvector extension
- **AI SDKs**: OpenRouter, Anthropic, OpenAI, Vercel AI SDK

### Development Tools
- **Linter**: ESLint 9 with TypeScript ESLint
- **Type Checking**: TypeScript 5.7.2 with strict mode
- **Bundler**: Vite with bundler module resolution
- **Font**: JetBrains Mono (code), Inter (body text)

## Code Structure

### Root Directory
```
/
├── src/                          # Main frontend application
│   ├── components/               # React components (UI + feature)
│   ├── lib/                      # Utility libraries and services
│   ├── types/                    # TypeScript type definitions
│   ├── data/                     # Static data and configuration
│   ├── hooks/                    # Custom React hooks
│   ├── styles/                   # Global styles
│   ├── App.tsx                   # Main application component
│   └── main.tsx                  # Application entry point
├── api-gateway/                  # Backend API proxy
│   ├── src/
│   │   ├── routes/               # API route handlers
│   │   ├── services/             # Business logic layer
│   │   │   └── providers/        # AI provider integrations
│   │   ├── middleware/           # Express middleware (auth, validation, error handling)
│   │   ├── config/               # Configuration management
│   │   └── utils/                # Utility functions
│   └── package.json              # Backend dependencies
├── .github/                      # GitHub configuration
├── package.json                  # Root dependencies
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite build configuration
└── tailwind.config.js            # Tailwind CSS configuration
```

### Component Organization
Components are organized by feature and complexity:

- **UI Components** (`src/components/ui/`): Radix UI primitives (Button, Card, Dialog, etc.)
- **Feature Components** (`src/components/`): Business logic components
- **ModelHub** (`src/components/ModelHub/`): Model catalog and testing suite
- **Slides** (`src/components/slides/`): Presentation components

### Service Layer
Services in `src/lib/` provide core business logic:
- `modelhub-service.ts`: Model registry, cost calculation, API validation
- `api-service.ts`: API integration utilities
- `openrouter-sdk.ts`: OpenRouter TypeScript SDK wrapper
- `unified-scraping.ts`: Multi-provider web scraping abstraction
- `documentChunker.ts`: RAG document chunking logic

## Coding Standards & Conventions

### TypeScript Guidelines

#### Type Definitions
- **Always** use explicit types for function parameters and return values
- Define interfaces in `src/types/` for shared types (e.g., `modelhub.ts`, `slides.ts`)
- Use `type` for unions and aliases, `interface` for object shapes
- Prefer union types over enums: `type AIProvider = 'openrouter' | 'anthropic' | ...`

```typescript
// ✅ Good - Explicit types
export async function invokeModel(
  apiKey: string,
  model: AIModel,
  messages: ChatMessage[]
): Promise<ModelResponse> {
  // implementation
}

// ❌ Avoid - Implicit any
async function invokeModel(apiKey, model, messages) {
  // implementation
}
```

#### Null Safety
- Enable `strictNullChecks` in tsconfig.json
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Check for null/undefined explicitly when necessary

```typescript
// ✅ Good
const apiKey = config.providers.anthropic ?? '';
const result = await client?.chat(request);

// ❌ Avoid
const apiKey = config.providers.anthropic || '';
```

#### Import Paths
- Use path aliases: `@/components`, `@/lib`, `@/types`
- Group imports: external libraries → internal modules → types → styles
- Use named exports over default exports for better refactoring

```typescript
// ✅ Good
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AIModel } from '@/types/modelhub';

// ❌ Avoid relative paths when alias is available
import { Button } from '../../components/ui/button';
```

### React Patterns

#### Component Structure
- Use functional components with TypeScript
- Props interface should be named `{ComponentName}Props`
- Destructure props in function signature
- Use React.FC sparingly (prefer explicit typing)

```typescript
// ✅ Good
interface ModelCardProps {
  model: AIModel;
  onSelect: (model: AIModel) => void;
  className?: string;
}

export function ModelCard({ model, onSelect, className }: ModelCardProps) {
  // implementation
}

// ❌ Avoid
export const ModelCard: React.FC<any> = (props) => {
  // implementation
}
```

#### State Management
- Use `useState` for local component state
- Use custom hooks for shared stateful logic
- Prefer controlled components for form inputs
- Use `useEffect` with proper dependency arrays

```typescript
// ✅ Good
const [apiKeys, setApiKeys] = useState<APIKeyStore>({
  keys: {},
  defaultProvider: 'openrouter'
});

useEffect(() => {
  validateAPIKey(apiKey);
}, [apiKey]); // Explicit dependencies

// ❌ Avoid
const [data, setData] = useState(); // Missing type
useEffect(() => {
  validateAPIKey(apiKey);
}); // Missing dependency array
```

#### Event Handlers
- Name handlers with `handle` prefix: `handleClick`, `handleSubmit`
- Use arrow functions for inline handlers to avoid binding issues
- Type event objects explicitly

```typescript
// ✅ Good
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // handle submission
};

// ❌ Avoid
const handleSubmit = async (e: any) => {
  // implementation
};
```

### API Service Patterns

#### Service Classes
- Use class-based services for stateful API clients
- Initialize clients in constructor with null check
- Throw `ProviderError` for API-specific errors
- Include logging for debugging

```typescript
// ✅ Good - Following api-gateway pattern
export class AnthropicService {
  private client: Anthropic | null = null;

  constructor() {
    const apiKey = config.providers.anthropic;
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    }
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    if (!this.client) {
      throw new ProviderError('Anthropic API key not configured', 'anthropic');
    }
    
    try {
      logger.info('Anthropic chat request', { model: request.model });
      const response = await this.client.messages.create(/* ... */);
      return this.transformResponse(response);
    } catch (error) {
      logger.error('Anthropic API error', { error });
      throw new ProviderError(error.message, 'anthropic');
    }
  }
}
```

#### API Functions
- Use async/await for asynchronous operations
- Handle errors with try/catch and meaningful error messages
- Return typed responses matching defined interfaces
- Validate inputs before making API calls

```typescript
// ✅ Good
export async function validateAPIKey(
  provider: AIProvider,
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  if (!apiKey || apiKey.trim() === '') {
    return { valid: false, error: 'API key is required' };
  }

  try {
    // Provider-specific validation logic
    const response = await testAPIKey(provider, apiKey);
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
```

### UI/UX Patterns

#### Styling with Tailwind
- Use Tailwind utility classes
- Follow mobile-first responsive design
- Use semantic color tokens: `bg-background`, `text-foreground`, `border-border`
- Leverage custom colors in `oklch` color space: `bg-primary`, `text-accent`

```typescript
// ✅ Good
<Card className="p-6 border-border bg-card hover:border-primary transition-colors">
  <h2 className="text-2xl font-bold mb-4">Title</h2>
  <p className="text-muted-foreground">Description</p>
</Card>

// ❌ Avoid inline styles
<Card style={{ padding: '24px', borderColor: '#333' }}>
```

#### Accessibility
- Use semantic HTML elements
- Include ARIA labels for interactive elements
- Ensure keyboard navigation support
- Use Radix UI primitives which include accessibility by default

```typescript
// ✅ Good
<Button 
  aria-label="Test model with current configuration"
  disabled={!apiKey}
  onClick={handleTest}
>
  Test Model
</Button>
```

#### Loading States
- Show loading indicators for async operations
- Disable buttons during processing
- Provide feedback on success/error

```typescript
// ✅ Good
const [isLoading, setIsLoading] = useState(false);

const handleTest = async () => {
  setIsLoading(true);
  try {
    await testModel();
    toast.success('Test completed successfully');
  } catch (error) {
    toast.error('Test failed: ' + error.message);
  } finally {
    setIsLoading(false);
  }
};

return (
  <Button disabled={isLoading} onClick={handleTest}>
    {isLoading ? 'Testing...' : 'Test Model'}
  </Button>
);
```

## Security Best Practices

### API Key Management
- **NEVER** commit API keys to version control
- Store keys in `.env` file (excluded via `.gitignore`)
- Use browser-only encrypted storage for frontend keys
- Validate keys before using them
- Implement API proxy pattern for production

```typescript
// ✅ Good - Using environment variables
const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

// ✅ Good - Browser-only storage with encryption
const encryptedKeys = localStorage.getItem('encrypted_api_keys');

// ❌ NEVER do this
const apiKey = 'sk-or-v1-hardcoded-key-12345';
```

### Input Validation
- Sanitize all user inputs before sending to APIs
- Validate data types and ranges
- Use Zod for runtime validation
- Implement rate limiting for API calls

```typescript
// ✅ Good
import { z } from 'zod';

const ChatRequestSchema = z.object({
  model: z.string().min(1),
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string()
  })),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().positive().optional()
});

export async function sendChatRequest(data: unknown) {
  const validated = ChatRequestSchema.parse(data); // Throws if invalid
  return await apiClient.chat(validated);
}
```

### Error Handling
- Use custom error classes for different error types
- Log errors with context (but never log sensitive data)
- Provide user-friendly error messages
- Handle edge cases explicitly

```typescript
// ✅ Good
export class ProviderError extends Error {
  constructor(message: string, public provider: AIProvider) {
    super(message);
    this.name = 'ProviderError';
  }
}

try {
  const response = await apiService.chat(request);
} catch (error) {
  if (error instanceof ProviderError) {
    logger.error(`Provider ${error.provider} error: ${error.message}`);
    return { error: 'API provider temporarily unavailable' };
  }
  throw error; // Re-throw unexpected errors
}
```

### CORS & Proxy Configuration
- Use API gateway for backend proxy
- Configure CORS headers properly
- Implement authentication middleware
- Add rate limiting per user/IP

```typescript
// ✅ Good - api-gateway middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

app.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

## Common Patterns

### Model Registry Pattern
Models are centrally defined in `src/lib/modelhub-service.ts`:

```typescript
export const AI_MODELS: AIModel[] = [
  {
    id: 'openrouter/anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'openrouter',
    contextWindow: 200000,
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    supportsStreaming: true,
    supportsVision: true,
  },
  // ... more models
];

// Helper functions
export function getModelById(id: string): AIModel | undefined {
  return AI_MODELS.find(model => model.id === id);
}

export function getModelsByProvider(provider: AIProvider): AIModel[] {
  return AI_MODELS.filter(model => model.model === provider);
}
```

### Streaming Response Pattern
Handle streaming responses with async generators:

```typescript
// ✅ Good
async function* streamChatResponse(
  model: AIModel,
  messages: ChatMessage[]
): AsyncGenerator<string, void, unknown> {
  const stream = await openai.chat.completions.create({
    model: model.id,
    messages,
    stream: true
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

// Usage in component
const handleStream = async () => {
  setResponse('');
  for await (const chunk of streamChatResponse(model, messages)) {
    setResponse(prev => prev + chunk);
  }
};
```

### Cost Calculation Pattern
Calculate costs based on token usage:

```typescript
export function calculateCost(model: AIModel, tokens: TokenUsage): number {
  const inputCost = (tokens.input / 1_000_000) * model.inputCostPer1M;
  const outputCost = (tokens.output / 1_000_000) * model.outputCostPer1M;
  return inputCost + outputCost;
}

export function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
}
```

### Document Chunking Pattern (RAG)
Split documents into overlapping chunks for vector storage:

```typescript
export interface ChunkingStrategy {
  chunkSize: number;      // tokens per chunk
  chunkOverlap: number;   // overlapping tokens
  separator?: string;     // text separator
}

export function chunkDocument(
  text: string, 
  strategy: ChunkingStrategy
): string[] {
  const chunks: string[] = [];
  // Chunking logic with overlap
  return chunks;
}
```

### Supabase Vector Storage Pattern
Store and search embeddings with pgvector:

```typescript
// Store embedding
export async function storeEmbedding(
  supabase: SupabaseClient,
  document: string,
  embedding: number[],
  metadata: Record<string, any>
) {
  const { data, error } = await supabase
    .from('documents')
    .insert({
      content: document,
      embedding,
      metadata,
      created_at: new Date().toISOString()
    });
    
  if (error) throw error;
  return data;
}

// Search similar documents
export async function searchSimilar(
  supabase: SupabaseClient,
  queryEmbedding: number[],
  limit: number = 5
) {
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: limit
  });
  
  if (error) throw error;
  return data;
}
```

## Copilot Custom Prompts

### For Model Catalog Work
When working on model catalog features, remember:
- Models are defined in `src/lib/modelhub-service.ts` in the `AI_MODELS` array
- Each model must have: id, name, provider, contextWindow, costs, capabilities
- Use helper functions: `getModelById()`, `getModelsByProvider()`
- Display models using the `ModelCard` or `UnifiedModelCatalog` components
- Include pricing information in USD per 1M tokens
- Support filtering by provider, capability, and cost range

### For Web Scraping Features
When implementing scraping functionality:
- Use the unified scraping layer in `src/lib/unified-scraping.ts`
- Support multiple providers: Firecrawl, Oxylabs, etc.
- Always handle rate limiting and errors gracefully
- Extract structured data with selectors or AI-powered extraction
- Cache scraped content to minimize API calls
- Respect robots.txt and rate limits

### For RAG Pipeline Work
When building RAG features:
- Use `src/lib/documentChunker.ts` for text splitting
- Default chunk size: 512 tokens with 50 token overlap
- Generate embeddings with OpenAI (1536d) or HuggingFace models
- Store vectors in Supabase with pgvector extension
- Use cosine similarity for vector search (threshold: 0.7)
- Include metadata: source, timestamp, chunk_index
- Implement hybrid search (vector + keyword) for best results

### For API Proxy Work
When working on the api-gateway:
- Follow Express.js patterns in `api-gateway/src/`
- Use service classes for provider integrations (`services/providers/`)
- Implement middleware for: auth, validation, rate limiting, error handling
- Log all requests and errors with `utils/logger.ts`
- Return consistent error responses with status codes
- Use environment variables for configuration (`config/env.ts`)
- Test with real API keys but never commit them

### For Supabase Integration
When working with Supabase:
- Initialize client with `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Use Row Level Security (RLS) policies for data access
- Store embeddings in columns with `vector(1536)` or `vector(3072)` type
- Create indexes: `ivfflat` for large datasets (>100K vectors)
- Use `match_documents` RPC function for similarity search
- Handle authentication with Supabase Auth
- Use real-time subscriptions for live updates

### For UI Component Development
When creating new UI components:
- Use Radix UI primitives from `@/components/ui/`
- Follow shadcn/ui component patterns
- Support dark mode with Tailwind's dark: prefix
- Use Phosphor Icons for consistency
- Implement loading states and error boundaries
- Make components accessible (ARIA labels, keyboard nav)
- Use responsive design: mobile-first with breakpoints (sm, md, lg, xl)

### For Type Definitions
When adding new types:
- Define shared types in `src/types/modelhub.ts` or create new type files
- Use descriptive names: `{Feature}{Type}` (e.g., `ModelResponse`, `ChatMessage`)
- Export interfaces and types for reuse
- Document complex types with JSDoc comments
- Use union types for enums: `type Status = 'idle' | 'loading' | 'success' | 'error'`
- Avoid `any` - use `unknown` and type guards instead

## AI Provider-Specific Guidelines

### OpenRouter
- Supports 100+ models with unified API
- Base URL: `https://openrouter.ai/api/v1`
- Requires `HTTP-Referer` and `X-Title` headers
- Use `@openrouter/ai-sdk-provider` for TypeScript
- Supports streaming, function calling, vision
- Cost-effective with automatic fallback

### Anthropic Claude
- Best for code analysis and reasoning
- 200K context window (Sonnet, Opus)
- Requires system messages separate from user messages
- Use `@anthropic-ai/sdk` for integration
- Supports vision, streaming, function calling
- Higher quality but higher cost

### DeepSeek
- 671B MoE model with 37B active parameters
- Extremely cost-effective (1/200th of GPT-4)
- Strong reasoning and coding capabilities
- Base URL: `https://api.deepseek.com`
- Use OpenAI-compatible SDK
- Best for budget-conscious deployments

### xAI Grok
- Real-time web search integration
- Grok 4.1 models with vision support
- Base URL: `https://api.x.ai/v1`
- OpenAI-compatible API
- Good for current events and research

### NVIDIA NIM
- Accelerated inference with optimized models
- Embeddings and reranking capabilities
- Use for high-throughput scenarios
- Supports custom model deployment
- Best for GPU-accelerated workloads

## Testing Guidelines

### Manual Testing
- Test API integrations with real keys in development
- Validate streaming responses work correctly
- Test error handling with invalid inputs
- Check responsive design on mobile/tablet/desktop
- Verify accessibility with keyboard navigation
- Test dark mode support

### API Testing
- Use the `ApiTester` component for manual API testing
- Validate API keys with real provider endpoints
- Test rate limiting and error responses
- Monitor token usage and costs
- Check streaming vs non-streaming responses

### Component Testing
- Test components in isolation with different props
- Verify loading and error states
- Check edge cases (empty data, null values)
- Test user interactions (clicks, form submissions)
- Validate responsive behavior

## Performance Optimization

### Bundle Size
- Use dynamic imports for large components
- Lazy load routes and heavy dependencies
- Tree-shake unused code
- Optimize images and assets

### API Calls
- Implement caching for repeated requests
- Debounce user input for search/filter
- Use pagination for large datasets
- Batch API calls when possible
- Cache embedding results to reduce costs

### Rendering
- Use React.memo for expensive components
- Optimize re-renders with useCallback/useMemo
- Virtualize long lists with react-virtual
- Lazy load images with native loading="lazy"

## Build & Deployment

### Development
```bash
npm install           # Install dependencies
npm run dev          # Start dev server (port 5173)
npm run lint         # Run ESLint
npm run build        # Build for production
npm run preview      # Preview production build
```

### API Gateway
```bash
cd api-gateway
npm install          # Install backend dependencies
npm run dev          # Start Express server
npm run build        # Compile TypeScript
```

### Environment Variables
Required variables in `.env`:
```bash
# Frontend (VITE_ prefix for Vite)
VITE_OPENROUTER_API_KEY=sk-or-v1-...
VITE_DEEPSEEK_API_KEY=sk-...
VITE_XAI_API_KEY=xai-...
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...

# Backend
OPENROUTER_API_KEY=sk-or-v1-...
ANTHROPIC_API_KEY=sk-ant-...
PORT=3000
```

## Copilot Best Practices for This Codebase

### DO:
- ✅ Use TypeScript with explicit types everywhere
- ✅ Follow existing patterns in similar components
- ✅ Use path aliases (@/) for imports
- ✅ Implement error handling and loading states
- ✅ Add JSDoc comments for complex functions
- ✅ Use Tailwind utility classes for styling
- ✅ Validate API inputs before sending requests
- ✅ Log errors with context (without sensitive data)
- ✅ Make components accessible and responsive
- ✅ Use environment variables for configuration

### DON'T:
- ❌ Use `any` type (use `unknown` with type guards)
- ❌ Commit API keys or secrets
- ❌ Use inline styles instead of Tailwind
- ❌ Ignore error handling
- ❌ Make API calls without validation
- ❌ Create new UI primitives (use Radix UI)
- ❌ Use default exports (prefer named exports)
- ❌ Hardcode configuration values
- ❌ Skip loading states for async operations
- ❌ Forget to clean up in useEffect

### When Suggesting Code:
1. **Match existing patterns** - Look at similar components/services first
2. **Include types** - All function parameters and returns should be typed
3. **Handle errors** - Always include try/catch for async operations
4. **Add loading states** - Show feedback for async actions
5. **Use existing utilities** - Check `src/lib/utils.ts` before creating new helpers
6. **Follow security practices** - Never expose API keys, validate inputs
7. **Be accessible** - Include ARIA labels and keyboard navigation
8. **Stay consistent** - Use the same naming conventions and patterns

### Areas Requiring Extra Caution

#### AI-Specific Logic
- Token counting and cost calculations must be accurate
- Model capability validation is critical for feature flags
- Streaming response handling requires careful state management
- API provider differences need abstraction layers

#### Data Validation
- All user inputs to AI models must be sanitized
- API responses should be validated against expected schemas
- File uploads need size and type restrictions
- Rate limiting must be enforced consistently

#### Vector Operations
- Embedding dimensions must match model specifications
- Vector similarity thresholds affect result quality
- Index types impact query performance
- Metadata filtering needs proper escaping

#### Security & Privacy
- API keys must never be logged or exposed
- User prompts may contain sensitive information
- Embedding storage should consider data retention policies
- CORS and CSP headers need careful configuration

## Examples of Quality Code Suggestions

### Example 1: Adding a New AI Model

```typescript
// In src/lib/modelhub-service.ts

// Add to AI_MODELS array
{
  id: 'provider/model-name',
  name: 'Friendly Model Name',
  provider: 'provider-name', // Must match AIProvider type
  contextWindow: 128000,
  inputCostPer1M: 1.0,       // USD per 1M tokens
  outputCostPer1M: 3.0,      // USD per 1M tokens
  capabilities: ['chat', 'code'], // Array of ModelCapability
  supportsStreaming: true,
  supportsVision: false,
  releaseDate: '2024-01-01',
  maxOutputTokens: 4096,
}
```

### Example 2: Creating a New Component

```typescript
// In src/components/FeatureName.tsx

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain } from '@phosphor-icons/react';
import type { AIModel } from '@/types/modelhub';

interface FeatureNameProps {
  model: AIModel;
  onComplete?: (result: string) => void;
  className?: string;
}

export function FeatureName({ model, onComplete, className }: FeatureNameProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.doSomething(model);
      setResult(response.data);
      onComplete?.(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`p-6 ${className || ''}`}>
      <div className="flex items-center gap-2 mb-4">
        <Brain size={24} className="text-primary" />
        <h2 className="text-xl font-semibold">Feature Name</h2>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mb-4 p-4 bg-muted rounded-md">
          <pre className="text-sm">{result}</pre>
        </div>
      )}
      
      <Button 
        onClick={handleAction}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Processing...' : 'Run Action'}
      </Button>
    </Card>
  );
}
```

### Example 3: Adding a New API Route

```typescript
// In api-gateway/src/routes/feature.ts

import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '@/middleware/validation';
import { requireAuth } from '@/middleware/auth';
import { ProviderError } from '@/middleware/errorHandler';
import logger from '@/utils/logger';

const router = Router();

const RequestSchema = z.object({
  model: z.string().min(1),
  input: z.string().min(1),
  options: z.object({
    temperature: z.number().min(0).max(2).optional(),
  }).optional(),
});

router.post(
  '/feature',
  requireAuth,
  validateRequest(RequestSchema),
  async (req, res, next) => {
    try {
      const { model, input, options } = req.body;
      
      logger.info('Feature request', { model, inputLength: input.length });
      
      const result = await processFeature(model, input, options);
      
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof ProviderError) {
        logger.error('Provider error', { 
          provider: error.provider, 
          message: error.message 
        });
      }
      next(error);
    }
  }
);

export default router;
```

---

## Additional Resources

- **Documentation**: See `README.md`, `COMPREHENSIVE_GUIDE.md`, `PRD.md`
- **Architecture**: See `ARCHITECTURE.md` for system design
- **Security**: See `SECURITY.md` and `ENV_SETUP.md`
- **Supabase RAG**: See `SUPABASE_VECTOR_RAG_GUIDE.md`
- **API Reference**: Check provider-specific docs in respective markdown files

## Version

This Copilot instructions file is maintained for the AI Integration Platform codebase. Last updated: 2024-12-30
