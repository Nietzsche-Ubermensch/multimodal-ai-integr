# Copilot Instructions

## Project Overview

This is a **multimodal AI integration** project — React/TypeScript/Vite frontend with Supabase backend. The default branch is `main`.

## Build & Test Commands

```bash
npm install          # install dependencies
npm run build        # production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm test             # run test suite
```

## Code Style

- TypeScript strict mode
- React functional components with hooks
- No `any` types — use proper interfaces
- No mock data — all integrations use real API calls
- Commit messages: `type: description` (types: fix, feat, refactor, docs, chore, ci)

## Architecture

- `src/` — React application source
- `.github/workflows/` — CI/CD pipelines (build, lint, typecheck, test, Docker image, Dependabot auto-merge)
- `Dockerfile` — Container build definition at repo root
- `supabase/` — Supabase backend configuration

## CI Workflows

| Workflow | Purpose |
|----------|---------|
| `build.yml` | Build, lint, typecheck, and test on push/PR |
| `docker-image.yml` | Build Docker image on push to main |
| `satisfy-required-checks.yml` | Mark required checks as passing for bot PRs |
| `dependabot-auto-merge.yml` | Auto-merge passing Dependabot PRs |
| `release.yml` | Release workflow |
| `claude-code-review.yml` | Automated code review |

## Analysis: docker/model-runner release.yml

The `release.yml` workflow from [docker/model-runner](https://github.com/docker/model-runner/blob/main/.github/workflows/release.yml) is a comprehensive release pipeline with the following structure:

### Trigger
- `workflow_dispatch` with inputs: `bumpType` (patch/minor/major), `releaseTag` (explicit override), `llamaServerVersion`, `vllmVersion`, `sglangVersion`, `imagesOnly` (skip CLI releases)

### Jobs

1. **prepare** — Resolves or creates the release tag. Auto-bumps the latest semver tag (vX.Y.Z) or uses an explicit tag. Creates and pushes the git tag.

2. **release-notes** — Generates AI-powered release notes using `docker/docker-agent-action` with an Anthropic API key. Falls back to a changelog link if generation fails. Uploads notes as an artifact.

3. **test** — Runs `go test -race ./...` on the Go codebase. Gates the build and release jobs.

4. **build** — Builds and pushes 7 Docker image variants to DockerHub:
   - CPU (amd64 + arm64)
   - CUDA (amd64 + arm64)
   - vLLM CUDA (amd64 + arm64)
   - SGLang CUDA (amd64)
   - ROCm (amd64)
   - MUSA (amd64)
   - OpenVINO (amd64)
   
   Uses Docker Buildx cloud builder, resolves upstream llama.cpp images per variant, and pushes with SBOM + provenance.

5. **release-cli-desktop** — Triggers the Desktop CLI release workflow in `docker/inference-engine-llama.cpp`, waits for completion. Has an idempotency guard checking if the desktop module image already exists.

6. **release-cli-docker-ce-trigger** — Triggers packaging in `docker/packaging`, waits, then triggers deploy in `docker/release-repo`. Uses monotonically increasing run IDs to identify the correct workflow run.

7. **verify-docker-ce** — Requires manual approval via `release-repo-deploy` environment. Installs Docker CE, starts the released image, and verifies client/server versions match the release tag.

8. **github-release** — Creates the GitHub Release with AI-generated notes. Idempotent — skips if release already exists. Sends a Slack notification on success.

### Key Patterns
- **Idempotency guards** throughout — re-runs for existing tags skip gracefully
- **Run ID tracking** — uses monotonic run IDs to identify triggered workflows (avoids race conditions with `gh workflow run`)
- **Strict semver** — all tags must match `^v[0-9]+\.[0-9]+\.[0-9]+$`
- **Parallel jobs** — release-notes and test run in parallel after prepare
- **Sequential gates** — build requires test; CLI releases require build; GitHub release requires all
