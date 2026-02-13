# Architecture

## System Overview

The **Multimodal AI Integration Platform** is a comprehensive web application for testing, comparing, and integrating 70+ AI models from 7+ providers. The system enables developers to validate API integrations, compare model performance, implement RAG pipelines, and build production-ready AI features.

**Architectural Style**: Modular Monorepo with Client-Server Architecture
- **Frontend**: React 19 SPA with TypeScript
- **Backend**: Express.js API Gateway
- **Database**: Supabase (PostgreSQL with pgvector)
- **Build**: Vite 7 with SWC transpilation

## Main Components

### Frontend Application (`src/`)
**Responsibility**: User interface, AI model interaction, live testing, and visualization

- **App.tsx**: Tab-based navigation shell (11 main sections)
- **components/**: React components organized by feature
  - `ui/`: 51 Radix UI primitives (shadcn/ui)
  - `ModelHub/`: GitHub Models integration
  - `AIModelHub/`: Model catalog, RAG, and chat interface
  - `PromptEngineering/`: Prompt studio and optimization tools
  - `slides/`: Presentation components
  - 40+ standalone feature components
- **lib/**: Service layer for business logic
  - `modelhub-service.ts`: Model registry and cost calculation
  - `ai-service.ts`: Core AI inference utilities
  - `unified-scraping.ts`: Multi-provider web scraping
  - `documentChunker.ts`: RAG document chunking
  - `supabase.ts`: Database client initialization
- **hooks/**: Custom React hooks (`useAIModels`, `useSupabaseAI`)
- **types/**: TypeScript type definitions
- **data/**: Static configuration (models, slides)

### Backend API Gateway (`api-gateway/`)
**Responsibility**: Secure API key management, rate limiting, and provider abstraction

- **src/index.ts**: Express server entry point
- **config/**: Environment and provider configuration
- **middleware/**: Authentication, validation, error handling, rate limiting
- **routes/**: REST API endpoints
  - `/api/chat`: Chat completion proxy
  - `/api/embeddings`: Embedding generation
  - `/api/providers`: Provider status
  - `/api/health`: Health checks
- **services/providers/**: AI provider integrations
  - `anthropic.ts`, `deepseek.ts`, `nvidia.ts`, `openrouter.ts`, `xai.ts`

### Database Layer (Supabase)
**Responsibility**: Data persistence, authentication, vector storage

- **supabase/functions/**: Edge functions for serverless operations
- **supabase/migrations/**: Database schema and pgvector setup
- Vector storage with pgvector extension for RAG pipelines

## Folder Structure

```
/
├── src/                      # React frontend
│   ├── components/           # UI components
│   ├── lib/                  # Service layer
│   ├── hooks/                # React hooks
│   ├── types/                # TypeScript definitions
│   └── data/                 # Static data
├── api-gateway/              # Express backend
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Request processing
│   │   └── config/           # Configuration
│   └── Dockerfile            # Container configuration
├── supabase/                 # Database and edge functions
├── tests/                    # Test suites (Vitest)
├── docs/                     # Documentation (50+ guides)
└── .github/                  # CI/CD workflows
```

## Data Flow

### AI Chat Request Flow
1. **User Input**: User enters prompt in chat interface
2. **Frontend Validation**: Input sanitization and validation
3. **API Gateway**: Request sent to `/api/chat` with encrypted API key
4. **Provider Service**: Authenticated call to AI provider (OpenRouter, Anthropic, etc.)
5. **Streaming Response**: Server-Sent Events stream chunks back to client
6. **UI Update**: React components update in real-time
7. **Cost Calculation**: Token usage tracked and displayed

### RAG Pipeline Flow
1. **Document Upload**: User provides document/URL
2. **Chunking**: Text split into overlapping chunks (512 tokens, 50 overlap)
3. **Embedding Generation**: Chunks converted to vectors via OpenAI/HuggingFace
4. **Vector Storage**: Embeddings stored in Supabase with pgvector
5. **Query Processing**: User query embedded and similarity search performed
6. **Context Retrieval**: Top-k relevant chunks retrieved
7. **Augmented Prompt**: Context injected into AI prompt
8. **Response Generation**: AI generates answer with retrieved context

## External Integrations

### AI Providers (7+)
- **OpenRouter**: Unified access to 100+ models
- **Anthropic**: Claude models (200K context)
- **DeepSeek**: Cost-effective reasoning (671B MoE)
- **xAI**: Grok with web search
- **OpenAI**: GPT-4, embeddings, DALL-E
- **NVIDIA NIM**: Accelerated inference
- **HuggingFace**: 500K+ open-source models

### Services
- **Supabase**: Auth, database, real-time subscriptions, edge functions
- **Firecrawl/Oxylabs**: Web scraping providers
- **GitHub API**: Repository integration and model catalog

### Third-Party SDKs
- `@openrouter/ai-sdk-provider`: OpenRouter TypeScript SDK
- `@supabase/supabase-js`: Database client
- `openai`: OpenAI SDK
- `@anthropic-ai/sdk`: Anthropic SDK

## Authentication & Authorization

### Frontend Security
- **Browser-Only Encrypted Storage**: API keys encrypted in localStorage
- **No Exposed Secrets**: Keys never committed to version control
- **Real-Time Validation**: Keys validated before use

### Backend Security
- **API Gateway Pattern**: All provider calls proxied through backend
- **JWT Authentication**: Token-based session management
- **Rate Limiting**: 100 requests/hour per user
- **Input Validation**: Zod schemas for all inputs
- **CORS Configuration**: Restricted origins
- **Environment Variables**: Keys stored in `.env` files

### Access Control
- Public routes: `/health`, `/api/providers`
- Protected routes: `/api/chat`, `/api/embeddings` (require valid API key)

## Scalability & Deployment

### Development
- **Hot Reload**: Vite dev server with HMR
- **Type Safety**: Strict TypeScript mode
- **Linting**: ESLint 9 with TypeScript rules
- **Testing**: Vitest for unit/integration tests

### Production Deployment
- **Frontend**: Vercel Edge Network (CDN distribution)
- **Backend**: Docker container deployment
- **Database**: Supabase managed PostgreSQL
- **CI/CD**: GitHub Actions workflows
  - Build validation
  - Type checking
  - Linting
  - Automated dependency updates

### Performance Optimizations
- **Code Splitting**: Dynamic imports for route-based splitting
- **Tree Shaking**: Unused code eliminated by Vite
- **Caching**: Response caching for repeated API calls
- **Streaming**: SSE for real-time AI responses
- **Vector Indexing**: pgvector ivfflat indexes for fast similarity search

### Scalability Considerations
- **Horizontal Scaling**: Stateless API gateway enables load balancing
- **Database Sharding**: Supabase supports read replicas
- **Rate Limiting**: Prevents abuse and controls costs
- **Multi-Region**: Edge functions deploy globally
- **Async Processing**: Queue-based processing for long-running tasks

## Future Extensibility

### Planned Extensions
- **Additional AI Providers**: Gemini, Perplexity, Together AI
- **Advanced RAG**: Hybrid search (vector + keyword), reranking
- **Model Fine-Tuning**: Custom model training interface
- **Collaborative Features**: Team workspaces, shared prompts
- **Enhanced Analytics**: Token usage dashboards, cost tracking
- **Plugin System**: Third-party integrations via webhooks

### Extension Points
- **Provider Interface**: Abstract base class for new AI providers
- **Middleware Stack**: Pluggable Express middleware
- **Component Library**: Extensible UI component system
- **Service Layer**: Modular services for new features
- **Type System**: Shared TypeScript interfaces for consistency
