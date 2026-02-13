# Contributing

## Development Setup

**Prerequisites**: Node.js 20+, Git, code editor

```bash
git clone https://github.com/Nietzsche-Ubermensch/multimodal-ai-integr.git
cd multimodal-ai-integr
npm install
cp .env.example .env  # Add API keys (see ENV_SETUP.md)
npm run dev           # Frontend at localhost:5173

# Optional: API gateway
cd api-gateway && npm install && npm run dev  # Backend at localhost:3000
```

**Verify**: `npm run build && npm run lint && npm test`

## Branching & Commits

**Branches**: `feature/<desc>`, `bugfix/<desc>`, `hotfix/<desc>` from `main`

**Commits** ([Conventional Commits](https://www.conventionalcommits.org/)):
```
feat(scope): add new feature
fix(api): resolve bug
docs(readme): update docs
refactor(ui): extract component
test(service): add tests
```

## Pull Requests

**Before PR**: Update from main, run lint/typecheck/tests, test manually

**Template**: Clear title, description, testing notes, screenshots (UI changes), breaking changes, linked issues

**Review**: ≥1 approval, all CI checks pass, address comments, focused scope

## Code Standards

**TypeScript**: Strict mode, explicit types, no `any`, use `@/` imports

**React**: Functional components, `{Component}Props` interface, hooks rules, `handle` prefix for events

**Linting**: `npm run lint` (auto-fix with `--fix`)

## Testing

**Write tests** for new functions/components in `tests/` directory

**Run**: `npm test` (watch) or `npm test -- --run` (single)

## Documentation

**Update**: README (setup/usage changes), ARCHITECTURE (new components), docs/ (detailed guides), inline comments (complex logic)

**Required**: JSDoc for public functions, shared types in `src/types/`

## Review Process

**Checklist**: Style compliance, tests pass, no TS errors, linter clean, docs updated, no vulnerabilities, minimal changes

**Merge**: Squash and merge, auto-delete branch

---

**Questions?** Open GitHub discussion | **Bugs?** Create issue | **Security?** See SECURITY.md
