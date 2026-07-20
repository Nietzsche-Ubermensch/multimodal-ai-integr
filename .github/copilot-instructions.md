# GitHub Copilot Instructions

> Tailored for the **AI Integration Platform** (`multimodal-ai-integr` / `spark-template`).
> Last verified: 2026-07-20 against `package.json`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `tailwind.config.js`, `components.json`, and CI workflow.

---

## Project Overview

A production-grade TypeScript platform for testing, comparing, and integrating 70+ AI models from 7+ providers (OpenRouter, Anthropic, DeepSeek, xAI, OpenAI, HuggingFace, NVIDIA NIM). Features include live API testing, streaming chat, side-by-side model comparison, RAG pipelines with Supabase pgvector, web scraping, prompt engineering, and an Express.js API gateway for secure server-side API calls.

### Core Capabilities
- **Unified Model Catalog**: 70+ models across chat, reasoning, code, vision, embeddings, reranking
- **Live API Testing**: Real-time key validation, streaming responses, model comparison
- **RAG Pipelines**: Document chunking, embedding generation, vector search via Supabase pgvector
- **API Gateway**: Express-based proxy for secure API key management and rate limiting
- **Web Scraping**: Unified scraping layer (Firecrawl, Oxylabs)
- **Prompt Engineering**: A/B testing, optimization studio

---

## Build & Test Commands

All commands run from the project root.

| Command | Description |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start Vite dev server on **port 5000** (not 5173) |
| `npm run build` | Type-check (`tsc -b --noCheck`) + Vite production build |
| `npm run lint` | ESLint 9 with typescript-eslint |
| `npm test` | Run Vitest test suite (`npm test -- --run` for single pass) |
| `npm run preview` | Preview production build |
| `npx tsc --noEmit` | Type-check only (used in CI) |

### API Gateway (backend)
```bash
cd api-gateway
npm install
npm run dev    # Start Express server
npm run build  # Compile TypeScript
```

### CI Pipeline (`.github/workflows/build.yml`)
CI runs on Node 20 and executes: `npm ci` → `npm run lint` → `npx tsc --noEmit` → `npm test -- --run` → `npm run build`. All must pass before merge.

---

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| Language | TypeScript | ~5.9.3 (target ES2020, strict null checks) |
| Frontend | React | 19.2.3 |
| Build Tool | Vite | 7.2.6 (with `@vitejs/plugin-react` SWC) |
| Styling | Tailwind CSS | v4 (via `@tailwindcss/vite` plugin) |
| UI Components | shadcn/ui (new-york style) + Radix UI primitives | — |
| Icons | lucide-react (primary), @phosphor-icons/react | — |
| Validation | Zod | 4.x |
| Database | Supabase (pgvector) | @supabase/supabase-js ^2.89 |
| Backend | Express.js (api-gateway) | — |
| Testing | Vitest 4 + @testing-library/react + jsdom | — |
| Linter | ESLint 9 + typescript-eslint | — |
| Fonts | JetBrains Mono (code), Inter (body) | Google Fonts |

### Special Plugins
- `@github/spark` — Vite plugin and Phosphor icon proxy. **Do not remove** these from `vite.config.ts`.

---

## Code Structure

```
/
├── src/                          # Frontend application
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives (Button, Card, Dialog, etc.)
│   │   ├── AIModelHub/           # Main model hub (2025 catalog, chat, compare, RAG)
│   │   ├── ModelHub/             # Legacy model catalog and testing suite
│   │   ├── PromptEngineering/    # Prompt studio, A/B testing, optimizer
│   │   └── *.tsx                 # Feature components (ApiTester, RAGDemo, etc.)
│   ├── lib/                      # Service layer and utilities
│   │   ├── api-service.ts        # API key validation, chat completion types
│   │   ├── supabase.ts           # Supabase client initialization
│   │   ├── supabase-proxy.ts     # Server-side proxy for Supabase calls
│   │   ├── input-validation.ts   # SSRF/XSS/DoS prevention utilities
│   │   ├── documentChunker.ts    # RAG document chunking
│   │   ├── modelRouter.ts        # Model routing logic
│   │   ├── openrouter-sdk.ts     # OpenRouter SDK wrapper
│   │   ├── xai-sdk.ts            # xAI SDK wrapper
│   │   ├── xai-service.ts        # XAI explanation service
│   │   ├── unified-scraping.ts   # Multi-provider web scraping
│   │   └── utils.ts              # cn() helper (clsx + tailwind-merge)
│   ├── hooks/                    # Custom React hooks (use-mobile, useAIModels, useSupabaseAI)
│   ├── types/                    # TypeScript type definitions (modelhub, slides, supabase-vector)
│   ├── data/                     # Static data (models, slides, unified model catalog)
│   ├── styles/                   # Theme styles
│   ├── App.tsx                   # Main app with tabbed navigation
│   ├── ErrorFallback.tsx         # Error boundary fallback
│   ├── main.tsx                  # Entry point (ErrorBoundary + App)
│   ├── main.css                  # Global styles (Tailwind import)
│   └── index.css                 # Additional global styles
├── api-gateway/                  # Express.js backend proxy
│   ├── routes/                   # API route handlers
│   ├── src/                      # Services, middleware, config, utils
│   ├── Dockerfile                # Docker deployment
│   └── docker-compose.yml
├── tests/                        # Test files (App.test.tsx, setup.ts)
├── docs/                         # Extensive documentation (50+ files)
├── .github/workflows/            # CI: build, lint, test, release, Docker
├── package.json                  # Root dependencies (npm workspaces)
├── tsconfig.json                 # TS config (bundler resolution, @/ alias)
├── vite.config.ts                # Vite config (port 5000, spark plugin)
├── tailwind.config.js            # Tailwind v4 with oklch theme tokens
├── eslint.config.js              # ESLint 9 flat config
└── components.json               # shadcn/ui config (new-york style)
```

---

## Code Style Conventions

### TypeScript
- **Strict null checks** enabled — use `?.` and `??` (not `||` for null/undefined)
- **Explicit types** on function parameters and return values
- Use `interface` for object shapes, `type` for unions and aliases
- Prefer **union types** over enums: `type AIProvider = 'openrouter' | 'anthropic' | ...`
- Avoid `any` — use `unknown` with type guards
- Target: ES2020, module: ESNext, moduleResolution: bundler

```typescript
// ✅ Good
export async function validateApiKey(
  provider: string,
  apiKey: string
): Promise<ApiValidationResult> { ... }

// ❌ Avoid
async function validateApiKey(provider, apiKey) { ... }
```

### Imports
- Use `@/` path alias (configured in `tsconfig.json` and `vite.config.ts`)
- Group: external libraries → internal modules → types → styles
- Prefer **named exports** over default exports

```typescript
// ✅ Good
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AIModel } from '@/types/modelhub';

// ❌ Avoid relative paths when alias is available
import { Button } from '../../components/ui/button';
```

### React Patterns
- Functional components with explicit props interfaces
- Props interface named `{ComponentName}Props`
- Destructure props in function signature
- `handle` prefix for event handlers: `handleSubmit`, `handleClick`
- Type event objects explicitly: `e: React.FormEvent<HTMLFormElement>`
- Always include `useEffect` dependency arrays
- Show loading states for all async operations
- Use `ErrorBoundary` (already wrapped in `main.tsx`)

```typescript
// ✅ Good
interface ModelCardProps {
  model: AIModel;
  onSelect: (model: AIModel) => void;
  className?: string;
}

export function ModelCard({ model, onSelect, className }: ModelCardProps) { ... }
```

### Styling (Tailwind CSS v4)
- Use Tailwind utility classes — **never** inline styles
- Theme uses `oklch` color space with CSS custom properties
- Dark mode: `[data-appearance="dark"]` selector (not `class` strategy)
- Semantic tokens: `bg-background`, `text-foreground`, `border-border`, `bg-card`
- Custom color scales: `neutral.1-12`, `accent.1-12`, `accent-secondary.1-12`
- Custom spacing scale via CSS variables (`var(--size-*)`)
- Custom border radius via CSS variables (`var(--radius-*)`)
- Use `cn()` from `@/lib/utils` for conditional class merging

```typescript
// ✅ Good
<Card className={cn("p-6 border-border bg-card hover:border-primary transition-colors", className)}>

// ❌ Avoid
<Card style={{ padding: '24px', borderColor: '#333' }}>
```

### UI Components
- Use shadcn/ui primitives from `@/components/ui/` — **never** create new UI primitives
- shadcn/ui style: `new-york` (per `components.json`)
- Icon library: `lucide-react` (primary, per `components.json`)
- Support dark mode and responsive design (mobile-first)
- Include ARIA labels for accessibility
- Radix UI primitives include accessibility by default

---

## Architecture Notes

### Frontend Architecture
- Single-page app with tabbed navigation (`App.tsx` uses Radix Tabs)
- Entry point: `main.tsx` wraps `App` in `react-error-boundary`
- `@github/spark` plugin provides platform-specific features (do not remove)
- Vite dev server runs on `0.0.0.0:5000` with `allowedHosts: true`

### Service Layer (`src/lib/`)
- `api-service.ts`: Provider endpoint configs, API key validation, chat types
- `supabase.ts`: Supabase client init from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- `input-validation.ts`: SSRF prevention (blocks private IPs, localhost), XSS sanitization, DoS limits
- `documentChunker.ts`: RAG text splitting with configurable chunk size/overlap
- `modelRouter.ts`: Model selection and routing logic
- `unified-scraping.ts`: Multi-provider web scraping abstraction

### API Gateway (`api-gateway/`)
- Express.js backend for secure server-side API calls
- Prevents API key exposure in frontend
- Includes auth middleware, rate limiting, input validation
- Provider services in `api-gateway/src/services/providers/`

### Supabase Integration
- pgvector for embedding storage and similarity search
- `match_documents` RPC function for vector search
- Row Level Security (RLS) policies
- RPC allowlists for security

### Environment Variables
Frontend (Vite `VITE_` prefix):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
Backend (set via `supabase secrets set`):
```
OPENROUTER_API_KEY, DEEPSEEK_API_KEY, XAI_API_KEY,
ANTHROPIC_API_KEY, GEMINI_API_KEY, PERPLEXITY_API_KEY
```
See `.env.example` for full reference.

---

## Common Pitfalls

1. **Dev server port is 5000, not 5173** — Vite config explicitly sets `port: 5000`
2. **Build uses `--noCheck`** — `npm run build` runs `tsc -b --noCheck` (skips type checking during build; CI runs `npx tsc --noEmit` separately)
3. **Never remove `@github/spark` plugins** from `vite.config.ts` — they are required for the platform
4. **Dark mode uses `[data-appearance="dark"]`** selector, not Tailwind's `class` strategy
5. **Tailwind CSS v4** — uses `@tailwindcss/vite` plugin, not PostCSS-based v3 setup. Theme is loaded from `theme.json` and merged with defaults in `tailwind.config.js`
6. **`@/` alias maps to `./src/`** — always use it instead of relative paths
7. **Never expose API keys in frontend code** — use the API gateway proxy pattern for production
8. **`testChatCompletion()` is intentionally disabled** in `api-service.ts` — it returns an error directing users to the API gateway. Do not "fix" this by adding direct API calls
9. **Supabase fallback credentials** exist in `supabase.ts` for development — always set proper env vars for production
10. **Zod 4.x** is in use — use `ZodType` not `ZodSchema` (breaking change from v3)
11. **ESLint flat config** — `eslint.config.js` uses the new flat config format (not `.eslintrc`)
12. **npm workspaces** — `packages/*` is configured as a workspace; be aware of hoisted dependencies

---

## Security Best Practices

- **Never commit `.env` files** — excluded in `.gitignore`
- **Never hardcode API keys** — use `import.meta.env.VITE_*` or server-side env vars
- **Validate all user inputs** — use `src/lib/input-validation.ts` for URL/text validation
- **Use Zod schemas** for runtime validation of API request/response data
- **SSRF prevention** — `validateUrl()` blocks localhost, private IPs, link-local, non-HTTP protocols
- **XSS prevention** — `sanitizeText()` removes control characters
- **DoS prevention** — input length limits enforced in `validateEmbeddingInput()`
- **API proxy pattern** — route API calls through `api-gateway` to keep keys server-side
- **Rate limiting** — implement per-user/IP in the API gateway
- **CORS** — configure properly in the API gateway, not in frontend

---

## Copilot Guidance

### DO
- ✅ Use TypeScript with explicit types everywhere
- ✅ Follow existing patterns in similar components/services
- ✅ Use `@/` path alias for all imports
- ✅ Use `cn()` from `@/lib/utils` for conditional classes
- ✅ Implement error handling and loading states for all async operations
- ✅ Use shadcn/ui components from `@/components/ui/`
- ✅ Validate API inputs with Zod before sending requests
- ✅ Use environment variables for all configuration
- ✅ Include ARIA labels and keyboard navigation for accessibility
- ✅ Add JSDoc comments for complex functions

### DON'T
- ❌ Use `any` type — use `unknown` with type guards
- ❌ Commit API keys, secrets, or `.env` files
- ❌ Use inline styles instead of Tailwind classes
- ❌ Create new UI primitives — use Radix UI / shadcn/ui
- ❌ Use default exports — prefer named exports
- ❌ Use relative paths when `@/` alias is available
- ❌ Hardcode configuration values (ports, URLs, model names)
- ❌ Skip loading/error states for async operations
- ❌ Forget `useEffect` cleanup and dependency arrays
- ❌ Remove or disable `@github/spark` Vite plugins

### When Suggesting Code
1. **Match existing patterns** — examine similar components/services first
2. **Include types** — all parameters and return values must be typed
3. **Handle errors** — always use try/catch for async operations with meaningful messages
4. **Add loading states** — show feedback for any async action
5. **Use existing utilities** — check `src/lib/` before creating new helpers
6. **Follow security practices** — never expose keys, validate all inputs
7. **Be accessible** — include ARIA labels and keyboard navigation
8. **Stay consistent** — use the same naming conventions and patterns as existing code

---

## Testing

- **Framework**: Vitest 4 with jsdom environment
- **Testing Library**: `@testing-library/react` + `@testing-library/user-event`
- **Setup**: `tests/setup.ts` (imported via `vitest/globals` types in `tsconfig.json`)
- **Run**: `npm test` (watch mode) or `npm test -- --run` (single pass)
- **Test files**: placed in `tests/` directory (e.g., `App.test.tsx`)
- Test component rendering, user interactions, and edge cases (empty data, null values, error states)

---

## Additional Resources

- **README.md** — Project overview, quick start, deployment guides
- **docs/ARCHITECTURE.md** — System architecture documentation
- **docs/SECURITY.md** — Security guidelines and best practices
- **docs/ENV_SETUP.md** — Environment variable setup for all platforms
- **docs/PRD.md** — Product requirements and design specifications
- **docs/CHANGELOG.md** — Version history and release notes
- **docs/DEPENDENCY_NOTES.md** — Dependency versions and migration guides
- **docs/SUPABASE_VECTOR_RAG_GUIDE.md** — Supabase vector RAG integration guide
