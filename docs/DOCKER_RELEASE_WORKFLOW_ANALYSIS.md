# Docker Model-Runner Release Workflow Analysis

This document provides a comprehensive analysis of the Docker model-runner release workflow, as referenced in Issue #39.

**Source**: [docker/model-runner/.github/workflows/release.yml](https://github.com/docker/model-runner/blob/main/.github/workflows/release.yml)

---

## Overview

The Docker model-runner release workflow is a sophisticated CI/CD pipeline for building and publishing Docker images across multiple compute platforms (CPU, CUDA, ROCm, MUSA, CANN). It is designed for AI/ML inference workloads requiring different hardware acceleration backends.

---

## Workflow Trigger

The workflow uses `workflow_dispatch`, allowing manual triggering with configurable inputs:

| Input | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `pushLatest` | boolean | No | `false` | Tag images as `latest` in addition to the release tag |
| `releaseTag` | string | No | `"test"` | Version tag for the release (e.g., `v1.0.0`) |
| `llamaServerVersion` | string | No | `"latest"` | Version of llama-server to include |
| `vllmVersion` | string | No | `"0.12.0"` | Version of vLLM to include |
| `sglangVersion` | string | No | `"0.4.0"` | Version of SGLang to include |
| `buildMusaCann` | boolean | No | `false` | Whether to build MUSA and CANN images |

---

## Jobs

### 1. Test Job

**Purpose**: Validates the codebase before building images.

**Steps**:
1. Checkout code
2. Set up Go (version 1.24.3 with caching)
3. Run Go tests (`go test ./...`)

**Key Characteristics**:
- Runs on `ubuntu-latest`
- Uses pinned action versions for reproducibility
- Caches Go modules for faster subsequent runs

---

### 2. Build Job

**Purpose**: Builds and pushes Docker images for multiple compute platforms.

**Dependencies**: Requires successful completion of the `test` job.

**Steps**:

#### a. Checkout Repository
Uses `actions/checkout` to pull the source code.

#### b. Format Tags
Dynamically generates Docker tags for each platform variant:
- CPU: `docker/model-runner:{tag}`
- CUDA: `docker/model-runner:{tag}-cuda`
- vLLM CUDA: `docker/model-runner:{tag}-vllm-cuda`
- SGLang CUDA: `docker/model-runner:{tag}-sglang-cuda`
- ROCm: `docker/model-runner:{tag}-rocm`
- MUSA: `docker/model-runner:{tag}-musa`
- CANN: `docker/model-runner:{tag}-cann`

If `pushLatest` is true, also generates corresponding `latest` tags.

#### c. Docker Hub Login
Authenticates to Docker Hub using organization credentials stored in `secrets.ORG_ACCESS_TOKEN`.

#### d. Docker Buildx Setup
Configures Docker Buildx with:
- Version: `lab:latest`
- Driver: `cloud`
- Endpoint: `docker/make-product-smarter` (Docker's build cloud)

#### e. Build Images (Multiple Steps)

Each platform variant is built separately:

| Image | Platforms | Base Image | Conditions |
|-------|-----------|------------|------------|
| CPU | linux/amd64, linux/arm64 | Default | Always |
| CUDA | linux/amd64, linux/arm64 | nvidia/cuda:12.9.0-runtime-ubuntu24.04 | Always |
| vLLM CUDA | linux/amd64, linux/arm64 | nvidia/cuda:13.0.2-runtime-ubuntu24.04 | Always |
| SGLang CUDA | linux/amd64 | nvidia/cuda:12.9.0-runtime-ubuntu24.04 | Always |
| ROCm | linux/amd64 | rocm/dev-ubuntu-22.04 | Always |
| MUSA | linux/amd64 | mthreads/musa:rc4.3.0-runtime-ubuntu22.04-amd64 | Only if `buildMusaCann` is true |
| CANN | linux/arm64, linux/amd64 | ascendai/cann:8.2.rc2-910b-ubuntu22.04-py3.11 | Only if `buildMusaCann` is true |

**Common Build Features**:
- SBOM (Software Bill of Materials) generation: `sbom: true`
- Provenance attestation: `provenance: mode=max`
- Multi-architecture builds where applicable
- Build arguments for version pinning

---

## Security Features

1. **Pinned Action Versions**: All GitHub Actions use SHA-based pinning for security
2. **SBOM Generation**: Provides transparency into image contents
3. **Provenance Attestation**: Cryptographically signed build provenance
4. **Secret Management**: Docker Hub credentials stored in GitHub Secrets

---

## Key Technologies Used

| Technology | Purpose |
|------------|---------|
| Go | Source code language (tested with `go test`) |
| Docker Buildx | Multi-platform image building |
| Docker Build Cloud | Accelerated builds via Docker's cloud infrastructure |
| llama.cpp | LLM inference (CPU-optimized) |
| vLLM | High-throughput LLM serving |
| SGLang | Fast and expressive LLM serving |
| CUDA | NVIDIA GPU acceleration |
| ROCm | AMD GPU acceleration |
| MUSA | Moore Threads GPU acceleration |
| CANN | Huawei Ascend NPU acceleration |

---

## Adaptation for This Repository

A release workflow adapted for this TypeScript/Node.js project has been created at:
`.github/workflows/release.yml`

**Key Differences**:

| Aspect | Original (model-runner) | Adapted (this repo) |
|--------|------------------------|---------------------|
| Language | Go | TypeScript/Node.js |
| Test Command | `go test ./...` | `npm run lint && npm run build` |
| Registry | Docker Hub | GitHub Container Registry (ghcr.io) |
| Image Variants | 7 (CPU, CUDA, vLLM, etc.) | 1 (single image) |
| Build Cloud | Docker Build Cloud | GitHub Actions runners |
| Multi-arch | Yes | Yes (linux/amd64, linux/arm64) |

---

## Usage

### Running the Original Workflow (Docker model-runner)

```bash
# Trigger via GitHub UI or gh CLI
gh workflow run release.yml \
  -f releaseTag=v1.0.0 \
  -f pushLatest=true \
  -f llamaServerVersion=latest
```

### Running the Adapted Workflow (This Repository)

```bash
# Trigger via GitHub UI or gh CLI
gh workflow run release.yml \
  -f releaseTag=v1.0.0 \
  -f pushLatest=true
```

---

## References

- [Docker model-runner repository](https://github.com/docker/model-runner)
- [GitHub Actions workflow syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Docker Buildx documentation](https://docs.docker.com/buildx/working-with-buildx/)
