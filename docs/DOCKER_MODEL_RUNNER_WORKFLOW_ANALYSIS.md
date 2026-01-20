# Docker Model Runner Release Workflow Analysis

This document provides a comprehensive analysis of the GitHub Actions workflow used by the Docker Model Runner project (`docker/model-runner`) for releasing container images.

**Source**: [https://github.com/docker/model-runner/blob/main/.github/workflows/release.yml](https://github.com/docker/model-runner/blob/main/.github/workflows/release.yml)

---

## 1. Primary Purpose

The **Release model-runner images for CE** workflow is designed to build and publish Docker container images for the Model Runner project to DockerHub. The workflow creates optimized container images across multiple GPU acceleration backends:

- **CPU** - Standard CPU-only image for general use
- **CUDA** - NVIDIA GPU acceleration
- **vLLM CUDA** - vLLM inference engine with CUDA support
- **SGLang CUDA** - SGLang inference engine with CUDA support
- **ROCm** - AMD GPU acceleration
- **MUSA** - Moore Threads GPU acceleration (optional)
- **CANN** - Huawei Ascend AI acceleration (optional)

The workflow supports both release builds and latest tag updates, enabling consistent multi-architecture (amd64/arm64) container distribution.

---

## 2. Key Steps in the Release Process

### 2.1 Workflow Trigger

The workflow is triggered manually via `workflow_dispatch` with configurable inputs:

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `pushLatest` | boolean | `false` | Tag images as `:latest` |
| `releaseTag` | string | `"test"` | Version tag for the release |
| `llamaServerVersion` | string | `"latest"` | llama.cpp server version |
| `vllmVersion` | string | `"0.12.0"` | vLLM inference engine version |
| `sglangVersion` | string | `"0.4.0"` | SGLang inference engine version |
| `buildMusaCann` | boolean | `false` | Build MUSA and CANN images |

### 2.2 Job 1: Test

**Runner**: `ubuntu-latest`

The test job validates the codebase before building:

1. **Checkout Code** - Clones the repository
2. **Set up Go** - Installs Go 1.24.3 with build caching
3. **Run Tests** - Executes `go test ./...` to validate all Go packages

### 2.3 Job 2: Build

**Runner**: `ubuntu-latest`  
**Dependencies**: Requires successful completion of the `test` job

The build job handles image creation and publishing:

1. **Checkout Repository** - Clones the repository
2. **Format Tags** - Generates Docker image tags based on inputs
3. **DockerHub Login** - Authenticates with DockerHub credentials
4. **Set up Buildx** - Configures Docker Buildx with cloud builder
5. **Build Images** - Builds and pushes 7 different image variants

---

## 3. Scripts and Actions Analysis

### 3.1 GitHub Actions Used

| Action | Version/SHA | Purpose |
|--------|-------------|---------|
| `actions/checkout` | `8e8c483db84b4bee98b60c0593521ed34d9990e8` | Clone repository |
| `actions/setup-go` | `4dc6199c7b1a012772edbd06daecab0f50c9053c` | Install Go toolchain |
| `docker/login-action` | `5e57cd118135c172c3672efd75eb46360885c0ef` | DockerHub authentication |
| `docker/setup-buildx-action` | `e468171a9de216ec08956ac3ada2f0791b6bd435` | Configure Docker Buildx |
| `docker/build-push-action` | `263435318d21b8e681c14492fe198d362a7d2c83` | Build and push images |

### 3.2 Tag Formatting Script

The workflow includes an inline Bash script that generates multi-line Docker tags using heredoc syntax:

```bash
# Example output for CPU tags when pushLatest=true:
# docker/model-runner:v1.0.0
# docker/model-runner:latest
```

This script creates tags for all 7 image variants (cpu, cuda, vllm-cuda, sglang-cuda, rocm, musa, cann).

### 3.3 Build Configurations

Each image variant has specific build arguments:

| Variant | Target | Platforms | Base Image |
|---------|--------|-----------|------------|
| CPU | `final-llamacpp` | linux/amd64, linux/arm64 | (default) |
| CUDA | `final-llamacpp` | linux/amd64, linux/arm64 | `nvidia/cuda:12.9.0-runtime-ubuntu24.04` |
| vLLM CUDA | `final-vllm` | linux/amd64, linux/arm64 | `nvidia/cuda:13.0.2-runtime-ubuntu24.04`* |
| SGLang CUDA | `final-sglang` | linux/amd64 | `nvidia/cuda:12.9.0-runtime-ubuntu24.04` |
| ROCm | `final-llamacpp` | linux/amd64 | `rocm/dev-ubuntu-22.04` |
| MUSA | `final-llamacpp` | linux/amd64 | `mthreads/musa:rc4.3.0-runtime-ubuntu22.04-amd64` |
| CANN | `final-llamacpp` | linux/arm64, linux/amd64 | `ascendai/cann:8.2.rc2-910b-ubuntu22.04-py3.11` |

> **\* Note**: vLLM CUDA uses a newer CUDA version (13.0.2) compared to other CUDA variants (12.9.0). This is because vLLM has specific CUDA requirements that differ from llama.cpp-based images.

### 3.4 Security Features

All image builds include:

- **SBOM (Software Bill of Materials)**: `sbom: true` - Generates and attaches SBOM attestation
- **Provenance Attestation**: `provenance: mode=max` - Maximum provenance information for supply chain security

---

## 4. Prerequisites and Environment Setup

### 4.1 Required Secrets

| Secret | Purpose |
|--------|---------|
| `ORG_ACCESS_TOKEN` | DockerHub authentication token for the `docker` organization |

### 4.2 Infrastructure Requirements

- **Docker Build Cloud**: The workflow uses Docker's cloud builder infrastructure:
  - Version: `lab:latest`
  - Endpoint: `docker/make-product-smarter`
  - Driver: `cloud`

### 4.3 Repository Requirements

The source repository must include:

1. **Dockerfile** - Multi-stage Dockerfile with targets:
   - `final-llamacpp` - llama.cpp based inference
   - `final-vllm` - vLLM based inference
   - `final-sglang` - SGLang based inference

2. **Go Module** - Valid Go project structure with testable packages

### 4.4 Build Arguments

The Dockerfile must accept these build arguments:

| Argument | Description |
|----------|-------------|
| `LLAMA_SERVER_VERSION` | Version of llama.cpp server to include |
| `LLAMA_SERVER_VARIANT` | Hardware variant (cuda, rocm, musa, cann) |
| `BASE_IMAGE` | Base container image for the build |
| `VLLM_VERSION` | vLLM package version |
| `VLLM_CUDA_VERSION` | CUDA version for vLLM (e.g., cu130) |
| `VLLM_PYTHON_TAG` | Python compatibility tag for vLLM |
| `SGLANG_VERSION` | SGLang package version |

---

## 5. Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    workflow_dispatch (Manual)                    │
│  Inputs: pushLatest, releaseTag, llamaServerVersion,            │
│          vllmVersion, sglangVersion, buildMusaCann              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         TEST JOB                                 │
│  1. Checkout code                                                │
│  2. Setup Go 1.24.3                                              │
│  3. Run go test ./...                                            │
└─────────────────────────────────────────────────────────────────┘
                                │ (needs: test)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BUILD JOB                                 │
│  1. Checkout repo                                                │
│  2. Format tags (bash script)                                    │
│  3. Login to DockerHub                                           │
│  4. Setup Buildx (cloud driver)                                  │
│  5. Build & Push Images:                                         │
│     ├── CPU (amd64, arm64)                                       │
│     ├── CUDA (amd64, arm64)                                      │
│     ├── vLLM CUDA (amd64, arm64)                                 │
│     ├── SGLang CUDA (amd64)                                      │
│     ├── ROCm (amd64)                                             │
│     ├── MUSA (amd64) [conditional]                               │
│     └── CANN (arm64, amd64) [conditional]                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DockerHub Registry                          │
│  Published images: docker/model-runner:{tag}[-variant]           │
│  Attestations: SBOM + Provenance                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Key Observations

### 6.1 Multi-Architecture Support

- Most images support both `linux/amd64` and `linux/arm64`
- SGLang CUDA is limited to `amd64` only (due to SGLang's current platform support)
- MUSA is limited to `amd64` only (Moore Threads GPU support is x86-64 specific)
- ROCm is limited to `amd64` only (AMD GPU drivers are primarily x86-64)
- CANN supports both `arm64` and `amd64` (Huawei Ascend hardware targets both architectures)

### 6.2 Conditional Builds

MUSA and CANN images are only built when `buildMusaCann` input is `true`, indicating these are still in development or have limited support.

### 6.3 Version Pinning

All GitHub Actions use specific commit SHAs rather than version tags, ensuring reproducible builds and protection against supply chain attacks.

### 6.4 Cloud Build Infrastructure

The workflow leverages Docker's cloud build infrastructure for improved build performance and cross-platform compilation capabilities.

---

## 7. Usage Example

To trigger a release:

1. Navigate to the repository's Actions tab
2. Select "Release model-runner images for CE"
3. Click "Run workflow"
4. Configure inputs:
   - `releaseTag`: `v1.2.0`
   - `pushLatest`: `true` (if this is the latest stable release)
   - `llamaServerVersion`: `b5000` (or specific version)
   - `vllmVersion`: `0.12.0`
   - `sglangVersion`: `0.4.0`
   - `buildMusaCann`: `false` (unless MUSA/CANN images are needed)

---

## 8. Related Documentation

- [Docker Model Runner Repository](https://github.com/docker/model-runner)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Docker Buildx](https://docs.docker.com/build/buildx/)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [vLLM](https://github.com/vllm-project/vllm)
- [SGLang](https://github.com/sgl-project/sglang)
