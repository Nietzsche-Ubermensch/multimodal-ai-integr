# CLAUDE.md

Project instructions for Claude Code when working on this repository.

## Project Overview

**multimodal-ai-integr** — Multimodal AI integration platform built with React, TypeScript, Vite, and Supabase.

## Stack

- **Frontend:** React 19, TypeScript, Vite 7, Tailwind CSS 4
- **UI:** Radix UI primitives, shadcn/ui components, Lucide icons, Framer Motion
- **State:** TanStack React Query
- **AI:** OpenAI SDK, OpenRouter AI SDK
- **Backend:** Supabase (auth, database, edge functions)
- **Testing:** Vitest, Testing Library
- **Linting:** ESLint 9 with TypeScript plugin
- **Build:** Vite with SWC, PostCSS

## Commands

```bash
npm run dev        # Start dev server (port 5000)
npm run build      # TypeScript check + Vite build
npm run test       # Run Vitest
npm run lint       # ESLint
npm run preview    # Preview production build
```

## Code Conventions

- TypeScript with `strictNullChecks` enabled
- Path alias: `@/*` maps to `./src/*`
- 2-space indentation
- JSDoc comments for public APIs
- Async/await over raw promises
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `ci:`

## Architecture

```
src/               # React application source
api-gateway/       # API gateway layer
supabase/          # Supabase config and migrations
supabase-external/ # External Supabase functions
tests/             # Test files
docs/              # Documentation
```

## Testing

- Write tests for all new code
- Tests live in `tests/` directory
- Use `vitest` globals (configured in tsconfig)
- Run `npm test` before pushing

## Git Workflow

- Branch naming: `feature/`, `bugfix/`, `hotfix/`
- Always create PRs, never push directly to main
- PRs trigger automatic Claude Code review
- Mention `@claude` in issues or PR comments for AI assistance

## Environment

- `.env` for local secrets (gitignored)
- `.env.example` for template
- Supabase project ID: `ccjdctnmgrweserduxhi`
