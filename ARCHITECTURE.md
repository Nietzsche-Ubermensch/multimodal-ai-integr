# Architecture

## System Overview

**Multimodal AI Integration Platform** - Web application for testing, comparing, and integrating 70+ AI models from 7+ providers with live API testing, RAG pipelines, and production-ready code examples.

**Style**: Modular monorepo with client-server architecture
- **Frontend**: React 19 SPA (TypeScript 5.7, Vite 7)
- **Backend**: Express.js API Gateway
- **Database**: Supabase (PostgreSQL + pgvector)

## Components

### Frontend (`src/`)
React application with tab-based navigation (11 sections)

**Structure**:
- `components/ui/`: 51 Radix UI primitives (shadcn/ui)
- `components/ModelHub/`: GitHub Models integration
- `components/AIModelHub/`: Model catalog, RAG, chat
- `lib/`: Service layer (AI inference, scraping, RAG chunking, Supabase client)
- `hooks/`: Custom React hooks
- `types/`: TypeScript definitions
- `data/`: Static configuration

### Backend (`api-gateway/`)
Express server for secure API proxying

**Structure**:
- `routes/`: REST endpoints (`/chat`, `/embeddings`, `/providers`, `/health`)
- `services/providers/`: AI provider integrations (Anthropic, DeepSeek, NVIDIA, OpenRouter, xAI)
- `middleware/`: Auth, validation, rate limiting, error handling
- `config/`: Environment configuration

### Database (Supabase)
PostgreSQL with pgvector for RAG
- Edge functions for serverless operations
- Vector storage for embeddings

## Data Flow

### AI Chat Request
1. User input → Frontend validation → API Gateway `/api/chat`
2. Provider service authenticates with AI provider
3. Streaming response via Server-Sent Events
4. Real-time UI updates and cost calculation

### RAG Pipeline
1. Document upload → Chunking (512 tokens, 50 overlap)
2. Embedding generation → Vector storage (Supabase pgvector)
3. Query embedding → Similarity search (cosine similarity)
4. Context retrieval → Augmented prompt → AI response

## Integrations

**AI Providers**: OpenRouter (100+ models), Anthropic (Claude), DeepSeek (671B MoE), xAI (Grok), OpenAI, NVIDIA NIM, HuggingFace

**Services**: Supabase (auth, database, real-time), Firecrawl/Oxylabs (web scraping), GitHub API

**SDKs**: `@openrouter/ai-sdk-provider`, `@supabase/supabase-js`, `openai`, `@anthropic-ai/sdk`

## Security

### Frontend
- Encrypted API key storage (localStorage)
- No secrets in version control
- Real-time key validation

### Backend
- API Gateway proxy pattern (all provider calls server-side)
- JWT authentication
- Rate limiting (100 req/hour/user)
- Input validation (Zod schemas)
- CORS restrictions

## Deployment

**Development**: Vite HMR (hot reload), TypeScript strict mode, ESLint 9

**Production**:
- Frontend: Vercel Edge Network
- Backend: Docker containers
- Database: Supabase managed PostgreSQL
- CI/CD: GitHub Actions (build, type-check, lint)

**Performance**:
- Code splitting (dynamic imports)
- Tree shaking (Vite)
- Response caching
- SSE streaming
- pgvector ivfflat indexes

**Scalability**:
- Stateless API gateway (horizontal scaling)
- Multi-region edge functions
- Database read replicas
- Async queue processing

## Future Extensions

**Planned**: Gemini/Perplexity integration, hybrid RAG search, model fine-tuning interface, team workspaces, analytics dashboard

**Extension Points**: Provider interface abstraction, middleware stack, component library, service layer modularity, shared type system
