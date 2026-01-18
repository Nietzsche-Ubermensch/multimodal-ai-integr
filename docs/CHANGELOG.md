# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - 2025-12-30

#### Features
- **Explainable AI (XAI) SDK** (#14) - Added comprehensive XAI SDK for neural network prediction transparency
  - 6 explanation methods: Feature importance, attention weights, gradients, integrated gradients, LRP, LIME
  - Multi-model support for text, vision, code, and multimodal AI models
  - Interactive XAI Explainer component with visualization
  - Batch processing and model comparison capabilities
  - Export functionality for JSON and CSV formats
  
- **Together AI BGE Embeddings** (#10) - Added Together AI BGE embeddings via OpenRouter for RAG pipeline
  - Integration with Together AI's BGE (BAAI General Embedding) models
  - Enhanced RAG pipeline with high-quality embeddings
  - Seamless integration through OpenRouter API

- **Trusted Bot Workflow** (#9) - Added trusted-bot workflow for required checks
  - Automated workflow for dependency updates
  - Required status checks for PR validation
  - Improved CI/CD pipeline reliability

- **Supabase Wrappers Edge Function v2.0** - Unified AI Gateway for all providers
  - Routes: `/wrappers/health`, `/wrappers/ai/:provider`, `/wrappers/rpc/:fn`
  - 6 AI providers: OpenRouter, DeepSeek, XAI, Anthropic, Gemini, Perplexity
  - JWT authentication with anonymous access support (anon key detection)
  - Per-user rate limiting: 60 req/min (authenticated), 30 req/min (anonymous/IP)
  - Token caps per provider to control costs (8k-16k depending on provider)
  - RPC allowlist: `match_documents`, `search_rag_vectors`, `get_profile`, etc.
  - CORS origin restrictions for security
  - `/health/deps` endpoint for upstream availability monitoring
  - `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `X-RateLimit-Type` headers

- **Frontend AI Service Integration** - Unified client for wrappers Edge Function
  - `src/lib/ai-service.ts`: Unified chat API with cost/latency tracking
  - `src/lib/supabase.ts`: Supabase client initialization and auth helpers
  - Updated `src/lib/modelRouter.ts` to route through wrappers (fixes CORS)

#### Security & Code Quality
- Enhanced security with rate limiting and JWT authentication
- Implemented RPC allowlists for database security
- Added input validation utilities to prevent SSRF, XSS, and DoS attacks
- Removed mock implementations that could mislead users
- Created proper API Gateway patterns for secure server-side operations

### Changed - 2025-12-30

#### Dependencies - Major Updates ⚠️

- **react-resizable-panels** 2.1.9 → 4.1.0 (#1) - BREAKING CHANGES
  - ⚠️ `expand()` API behavior change: Panels now expand to fill available space differently
  - ⚠️ `defaultLayout` handling: Default layout prop behavior has changed
  - Migration guide available in [DEPENDENCY_NOTES.md](./DEPENDENCY_NOTES.md)
  
- **recharts** 2.15.4 → 3.6.0 (#3) - BREAKING CHANGES
  - ⚠️ TypeScript types restructured: Import paths and type definitions updated
  - ⚠️ Animation API updates: Animation configuration has new syntax
  - Migration guide available in [DEPENDENCY_NOTES.md](./DEPENDENCY_NOTES.md)

#### Dependencies - Minor Updates

- **react** 19.2.0 → 19.2.3 (#2)
  - Bug fixes and performance improvements
  - No breaking changes

- **eslint** 9.39.1 → 9.39.2 (#4)
  - Bug fixes and rule updates
  - No breaking changes

- **@eslint/js** 9.39.1 → 9.39.2 (#5)
  - Updated to match ESLint version
  - No breaking changes

### Fixed - 2025-12-30

- **CORS issues** - All AI requests now proxy through Supabase Edge Functions
- Removed mock embedding generation that returned random numbers
- Removed mock chat completion that returned fake responses
- Created `match_documents` SQL function to fix frontend-database mismatch
- Added proper error messages directing users to API Gateway endpoints

### Security - 2025-12-30

- Implemented SSRF protection with URL validation
- Added XSS prevention via control character filtering
- Implemented DoS protection with input size limits
- Enhanced API key security through API Gateway pattern
- Added rate limiting and JWT authentication middleware

## Migration Guide

### Breaking Changes in Dependencies

For detailed migration instructions for breaking changes in `react-resizable-panels` v4 and `recharts` v3, please see [DEPENDENCY_NOTES.md](./DEPENDENCY_NOTES.md).

### Security Enhancements

If you were previously using direct API calls from the frontend:
- Replace direct `generateEmbedding()` calls with API Gateway endpoint `/api/v1/embeddings`
- Replace direct `testChatCompletion()` calls with API Gateway endpoint `/api/v1/chat`
- Update Supabase database with new `match_documents` function migration

See [SECURITY.md](./SECURITY.md) for complete security guidelines.

## Repository Maintenance

For repository maintenance guidelines and recommendations, see the "Repository Maintenance" section in [README.md](./README.md).

---

**Note**: This changelog focuses on user-facing changes. For internal development changes, see individual pull request descriptions.
