# CLAUDE.md

Project instructions for Claude Code when working on this repository.

## Project Overview

**multimodal-ai-integr** — Multimodal AI integration platform with 70+ models from 7+ providers. Features live model testing, RAG pipelines, prompt engineering studio, web scraping, and an Express.js API gateway.

## Stack

- **Frontend:** React 19, TypeScript 5.7, Vite 7, Tailwind CSS 4
- **UI:** Radix UI / shadcn/ui (51 primitives), Lucide + Phosphor icons, Framer Motion
- **State:** TanStack React Query 5
- **AI SDKs:** OpenAI 6.x, OpenRouter AI SDK, Anthropic SDK, xAI SDK
- **Backend:** Express.js API gateway (`api-gateway/`), Supabase edge functions
- **Database:** Supabase (auth, postgres, pgvector for RAG)
- **Charts:** Recharts, D3, Three.js
- **Testing:** Vitest 4, Testing Library (React, jest-dom, user-event)
- **Linting:** ESLint 9 with TypeScript ESLint
- **Build:** Vite 7 + SWC, GitHub Spark plugin, PostCSS

## Commands

```bash
# Root (frontend)
npm run dev        # Vite dev server on :5000
npm run build      # tsc --noCheck + vite build
npm run test       # Vitest
npm run lint       # ESLint
npm run preview    # Preview production build

# API Gateway (backend)
cd api-gateway
npm run dev        # Express dev server (tsx watch)
npm run build      # tsc + tsc-alias
npm run lint       # ESLint
npm test           # Vitest
```

## Architecture

```
src/                          # React frontend
  App.tsx                     # Tab-based navigation (11 tabs)
  components/
    ui/                       # 51 shadcn/ui primitives (DO NOT modify unless needed)
    ModelHub/                 # GitHub Models integration (14 files)
    AIModelHub/               # Main model catalog + RAG + chat (10 files)
    PromptEngineering/        # Prompt studio, optimizer, A/B testing (3 files)
    slides/                   # Presentation slides (9 files)
    [40+ feature components]  # Standalone feature panels
  hooks/                      # useAIModels, useSupabaseAI, use-mobile
  lib/                        # Service layer (20 files)
    ai-service.ts             # Core AI inference
    modelhub-service.ts       # Model registry + cost calculation
    ai-search-service.ts      # AI-powered search
    xai-sdk.ts                # Explainable AI SDK
    unified-scraping.ts       # Multi-provider web scraping
    documentChunker.ts        # RAG document chunking
    supabase.ts               # Supabase client init
    supabase-proxy.ts         # Supabase edge function proxy
    input-validation.ts       # Input validation utilities
  types/                      # TypeScript interfaces (modelhub, slides, supabase-vector)
  data/                       # Static data (models, slides, catalog)
  styles/                     # Theme CSS

api-gateway/                  # Express.js backend
  src/
    index.ts                  # Express app entry
    config/                   # env.ts, providers.ts
    middleware/               # auth, errorHandler, rateLimit, validation
    routes/                   # auth, chat, embeddings, health, providers, rerank, vectorSearch
    services/providers/       # anthropic, deepseek, nvidia, openrouter, xai
    utils/                    # logger
  routes/                     # Additional routes (optimize-prompt)
  Dockerfile                  # Docker containerization
  docker-compose.yml          # Docker compose config

supabase/                     # Supabase config
  functions/                  # Edge functions (generate-embedding, wrappers)
  migrations/                 # SQL migrations (pgvector)

supabase-external/            # Supabase monorepo fork (apps, packages, etc.)
tests/                        # Frontend tests (Vitest + Testing Library)
docs/                         # 50+ markdown guides
```

## App Tabs (src/App.tsx)

| Tab | Component | Purpose |
|-----|-----------|---------|
| AI Model Hub 2025 | `AIModelHub2025` | Main model catalog with 70+ models |
| GitHub Models | `ModelHubApp` | GitHub-hosted model testing |
| Dashboard | `ModelHubDashboard` | Analytics and metrics |
| Chat | `LibreChatInterface` | Multi-provider chat UI |
| AI Search | `AISearchPanel` | AI-powered search |
| RAG Testing | `RAGTestingPanel` | RAG pipeline testing |
| Scraping | `UnifiedScrapingLayer` | Web scraping tools |
| Prompts | `PromptStudio` | Prompt engineering studio |
| Legacy Hub | `ModelHubApp` | Original model hub |
| Vector DB | `SupabaseVectorRAG` | pgvector integration |
| Chunking | `DocumentChunkingDemo` | Document chunking demo |

## AI Providers

OpenRouter, Anthropic, DeepSeek, xAI/Grok, OpenAI, HuggingFace, NVIDIA NIM, GitHub Models, Gemini, Perplexity, Together AI

## Code Conventions

- TypeScript with `strictNullChecks` enabled
- Path alias: `@/*` maps to `./src/*`
- 2-space indentation
- JSDoc comments for public APIs
- Async/await over raw promises
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `ci:`
- Union types over enums
- Functional components with typed props interfaces
- Event handlers prefixed with `handle`
- Custom hooks in `src/hooks/` with `use` prefix
- Services as classes in `src/lib/`

## Testing

- Tests in `tests/` directory
- Vitest globals configured in `tsconfig.json`
- Testing Library for React component tests
- Run `npm test -- --run` for single pass
- Write tests for all new code

## Git Workflow

- Branch naming: `feature/`, `bugfix/`, `hotfix/`
- Always create PRs, never push directly to main
- PRs trigger automatic Claude Code review (`claude-code-review.yml`)
- Mention `@claude` in issues or PR comments for AI assistance (`claude.yml`)
- CI runs: lint, type check, test, build (`build.yml`)
- Dependabot auto-merges patch/minor updates

## GitHub Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `build.yml` | push/PR to main | Lint + typecheck + test + build |
| `claude.yml` | `@claude` mentions | AI code assistance |
| `claude-code-review.yml` | PR events | Automatic code review |
| `release.yml` | manual dispatch | Docker multi-arch build + GHCR push |
| `dependabot-auto-merge.yml` | Dependabot PRs | Auto-merge patches |
| `satisfy-required-checks.yml` | PR from trusted bots | Bypass checks for Copilot/Dependabot |
| `docker-image.yml` | push/PR to main | Build supabase-studio image |

## Environment

- `.env` for local secrets (gitignored) -- see `.env.example`
- Supabase project ID: `ccjdctnmgrweserduxhi`
- Vite exposes env vars with `VITE_` prefix
- API gateway env vars: provider API keys, JWT secret, Redis URL

## Key Dependencies to Know

- `@github/spark` — GitHub Spark web components (DO NOT REMOVE spark plugin from vite.config.ts)
- `@openrouter/ai-sdk-provider` — OpenRouter integration
- `cmdk` — Command palette (Cmd+K)
- `sonner` — Toast notifications
- `vaul` — Drawer component
- `zod` — Schema validation
- `react-hook-form` + `@hookform/resolvers` — Forms

## Secrets (GitHub)

- `ANTHROPIC_API_KEY` — Claude Code workflows
- `CLAUDE_CODE_OAUTH_TOKEN` — Claude Code OAuth
