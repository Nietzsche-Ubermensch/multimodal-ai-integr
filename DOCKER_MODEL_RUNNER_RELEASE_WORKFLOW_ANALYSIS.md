# Docker Model-Runner Release Workflow Analysis

**Source**: https://github.com/docker/model-runner/blob/main/.github/workflows/release.yml  
**Date Analyzed**: January 9, 2026  
**Purpose**: Comprehensive analysis of Docker's model-runner release automation workflow

---

## 1. Primary Purpose

The **Docker model-runner release workflow** is a GitHub Actions workflow designed to automate the building and publishing of Docker container images for running Large Language Models (LLMs) on various hardware acceleration platforms. 

### Key Objectives:
- **Multi-platform Support**: Build optimized Docker images for different hardware accelerators (CPU, CUDA/NVIDIA GPUs, AMD ROCm, Moore Threads MUSA, Ascend CANN)
- **Multiple Inference Engines**: Support different LLM inference frameworks (llama.cpp, vLLM, SGLang)
- **Community Edition Release**: Streamline the release process for Docker's Community Edition (CE) model-runner images
- **Version Management**: Allow flexible version tagging with optional "latest" tag promotion
- **Quality Assurance**: Ensure all releases pass automated tests before building images

---

## 2. Key Steps in the Release Process

The workflow consists of **two main jobs** that execute sequentially:

### Job 1: Test (Quality Gate)
**Purpose**: Validate code quality before proceeding with image builds

**Steps**:
1. **Checkout code** - Retrieve repository source code using `actions/checkout@8e8c483`
2. **Set up Go environment** - Install Go 1.24.3 with dependency caching using `actions/setup-go@4dc6199c`
3. **Run tests** - Execute Go test suite (`go test ./...`) to verify all components function correctly

**Significance**: This acts as a quality gate - if tests fail, the build job never executes, preventing broken images from being published.

---

### Job 2: Build (Image Creation & Publishing)
**Purpose**: Build and publish Docker images for multiple hardware platforms

**Dependency**: Only runs after the `test` job completes successfully (`needs: test`)

**Steps**:

#### Step 1: Repository Checkout
- **Action**: `actions/checkout@8e8c483`
- **Purpose**: Get the latest source code for building images

#### Step 2: Format Tags (Critical Step)
- **Type**: Custom bash script
- **Purpose**: Dynamically generate Docker image tags based on input parameters
- **Logic**:
  - Creates tags for 7 different image variants (CPU, CUDA, vLLM-CUDA, SGLang-CUDA, ROCm, MUSA, CANN)
  - Each variant gets a version-specific tag (e.g., `docker/model-runner:v1.0-cuda`)
  - If `pushLatest` is true, also adds `:latest` and `:latest-{variant}` tags
- **Output**: Multi-line outputs stored in `$GITHUB_OUTPUT` for use in subsequent steps

**Example Tag Generation**:
```bash
# For release tag "v1.0" with pushLatest=true
docker/model-runner:v1.0
docker/model-runner:latest
docker/model-runner:v1.0-cuda
docker/model-runner:latest-cuda
# ... (and so on for each variant)
```

#### Step 3: DockerHub Authentication
- **Action**: `docker/login-action@5e57cd1`
- **Purpose**: Authenticate to DockerHub registry
- **Credentials**: 
  - Username: `"docker"` (hardcoded)
  - Password: `${{ secrets.ORG_ACCESS_TOKEN }}` (organization secret)

#### Step 4: Set up Docker Buildx
- **Action**: `docker/setup-buildx-action@e468171`
- **Purpose**: Configure advanced Docker build capabilities
- **Configuration**:
  - Version: `"lab:latest"` (experimental features)
  - Driver: `cloud` (Docker Cloud Build service)
  - Endpoint: `"docker/make-product-smarter"` (custom Docker Cloud endpoint)
  - Install: `true` (make buildx the default builder)
- **Significance**: Enables multi-platform builds and cloud-based build acceleration

#### Step 5-11: Build Individual Image Variants

The workflow builds **7 different image variants**, each optimized for specific hardware:

##### **5. CPU Image (llama.cpp)**
- **Platforms**: `linux/amd64`, `linux/arm64` (multi-architecture support)
- **Target**: `final-llamacpp` (Dockerfile build stage)
- **Base Image**: Default (specified in Dockerfile)
- **Build Args**: 
  - `LLAMA_SERVER_VERSION`: Version of llama.cpp server
- **Purpose**: General-purpose CPU inference without GPU acceleration
- **SBOM & Provenance**: Enabled for supply chain security

##### **6. CUDA Image (llama.cpp + NVIDIA GPU)**
- **Platforms**: `linux/amd64`, `linux/arm64`
- **Target**: `final-llamacpp`
- **Base Image**: `nvidia/cuda:12.9.0-runtime-ubuntu24.04`
- **Build Args**: 
  - `LLAMA_SERVER_VERSION`
  - `LLAMA_SERVER_VARIANT=cuda`
  - `BASE_IMAGE` override
- **Purpose**: NVIDIA GPU-accelerated inference using CUDA 12.9

##### **7. vLLM CUDA Image (vLLM Inference Engine)**
- **Platforms**: `linux/amd64`, `linux/arm64`
- **Target**: `final-vllm` (different Dockerfile stage)
- **Base Image**: `nvidia/cuda:13.0.2-runtime-ubuntu24.04` (CUDA 13.0)
- **Build Args**: 
  - `VLLM_VERSION`: Version of vLLM framework (default: 0.12.0)
  - `VLLM_CUDA_VERSION=cu130`
  - `VLLM_PYTHON_TAG=cp38-abi3` (Python 3.8+ ABI compatibility)
- **Purpose**: High-performance inference using vLLM framework on NVIDIA GPUs

##### **8. SGLang CUDA Image (SGLang Inference Engine)**
- **Platforms**: `linux/amd64` only (no ARM64 support)
- **Target**: `final-sglang`
- **Base Image**: `nvidia/cuda:12.9.0-runtime-ubuntu24.04`
- **Build Args**: 
  - `SGLANG_VERSION`: Version of SGLang framework (default: 0.4.0)
- **Purpose**: Structured Generation Language (SGLang) optimized inference on NVIDIA GPUs

##### **9. ROCm Image (AMD GPU)**
- **Platforms**: `linux/amd64` only
- **Target**: `final-llamacpp`
- **Base Image**: `rocm/dev-ubuntu-22.04`
- **Build Args**: 
  - `LLAMA_SERVER_VARIANT=rocm`
- **Purpose**: AMD GPU-accelerated inference using ROCm stack

##### **10. MUSA Image (Moore Threads GPU)** *(Conditional)*
- **Condition**: Only builds if `buildMusaCann` input is `true`
- **Platforms**: `linux/amd64` only
- **Target**: `final-llamacpp`
- **Base Image**: `mthreads/musa:rc4.3.0-runtime-ubuntu22.04-amd64`
- **Build Args**: 
  - `LLAMA_SERVER_VARIANT=musa`
- **Purpose**: Moore Threads GPU acceleration (Chinese GPU manufacturer)
- **Note**: Experimental/optional - requires llama.cpp MUSA support

##### **11. CANN Image (Ascend NPU)** *(Conditional)*
- **Condition**: Only builds if `buildMusaCann` input is `true`
- **Platforms**: `linux/arm64`, `linux/amd64` (multi-architecture)
- **Target**: `final-llamacpp`
- **Base Image**: `ascendai/cann:8.2.rc2-910b-ubuntu22.04-py3.11`
- **Build Args**: 
  - `LLAMA_SERVER_VARIANT=cann`
- **Purpose**: Huawei Ascend NPU acceleration using CANN toolkit
- **Note**: Experimental/optional - requires llama.cpp CANN support

### Common Build Configuration (All Images)
All image builds share these characteristics:
- **Push**: `true` - Images are pushed to DockerHub
- **SBOM**: `true` - Software Bill of Materials generated for security
- **Provenance**: `mode=max` - Maximum build provenance metadata for supply chain security
- **Action**: `docker/build-push-action@2634353` (specific SHA for reproducibility)

---

## 3. Scripts and Actions Called

### GitHub Actions (External Dependencies)

#### **actions/checkout@8e8c483db84b4bee98b60c0593521ed34d9990e8**
- **Purpose**: Clone the repository code
- **Usage**: Used twice (test job and build job)
- **Significance**: Pinned to specific SHA for security and reproducibility

#### **actions/setup-go@4dc6199c7b1a012772edbd06daecab0f50c9053c**
- **Purpose**: Install and configure Go programming language
- **Configuration**: 
  - Go version: 1.24.3 (latest stable)
  - Cache: Enabled (speeds up subsequent runs)
- **Significance**: Required for running Go-based tests

#### **docker/login-action@5e57cd118135c172c3672efd75eb46360885c0ef**
- **Purpose**: Authenticate to DockerHub container registry
- **Security**: Uses GitHub Secrets for credentials (`ORG_ACCESS_TOKEN`)
- **Significance**: Required to push images to `docker/model-runner` repository

#### **docker/setup-buildx-action@e468171a9de216ec08956ac3ada2f0791b6bd435**
- **Purpose**: Set up Docker Buildx for advanced build features
- **Features Enabled**:
  - Multi-platform builds (cross-compilation)
  - Cloud-based building (faster, distributed builds)
  - Build caching and optimization
- **Significance**: Critical for building multi-architecture images efficiently

#### **docker/build-push-action@263435318d21b8e681c14492fe198d362a7d2c83**
- **Purpose**: Build and push Docker images
- **Usage**: Called 7 times (once per image variant)
- **Features**:
  - Multi-platform building
  - SBOM generation (software supply chain security)
  - Provenance attestation (build integrity verification)
  - Tag management
- **Significance**: Core action that performs the actual image building

### Custom Scripts

#### **Tag Formatting Script (Bash)**
Located in the "Format tags" step, this script:
- **Language**: Bash shell script
- **Inputs**: `inputs.releaseTag`, `inputs.pushLatest`
- **Outputs**: 7 multi-line tag sets (cpu, cuda, vllm-cuda, sglang-cuda, rocm, musa, cann)
- **Logic**:
  ```bash
  # For each variant:
  1. Output variant-specific tag with release version
  2. If pushLatest == true, also output :latest variant tag
  3. Store in $GITHUB_OUTPUT using heredoc syntax
  ```
- **Significance**: Provides dynamic, conditional tagging strategy based on release type

### External Dependencies
- **Go test suite** (`go test ./...`): Repository's own test suite
- **Dockerfile**: Multi-stage Dockerfile with targets: `final-llamacpp`, `final-vllm`, `final-sglang`
- **llama.cpp**: LLM inference engine (various versions)
- **vLLM**: High-performance LLM serving framework
- **SGLang**: Structured generation framework

---

## 4. Prerequisites and Environment Setup

### Required Secrets
The workflow requires the following GitHub Secrets to be configured:

1. **`ORG_ACCESS_TOKEN`**
   - **Type**: DockerHub access token or password
   - **Scope**: Write access to `docker/model-runner` repository on DockerHub
   - **Usage**: Authenticate to DockerHub for image pushing
   - **Security**: Must be stored as a GitHub organization or repository secret

### Required Permissions

#### GitHub Permissions
- **Actions**: Read/Write (to execute workflow)
- **Contents**: Read (to checkout code)
- **Packages**: Write (if using GitHub Container Registry, though this workflow uses DockerHub)

#### DockerHub Permissions
- Organization access to `docker` namespace
- Permission to create/update `docker/model-runner` repository
- Push access for the authenticated user/token

### Infrastructure Requirements

#### GitHub Actions Runner
- **OS**: Ubuntu-latest (both jobs)
- **Resources**: Default GitHub-hosted runner specifications
- **Network**: Outbound access to:
  - DockerHub (`docker.io`)
  - Docker Cloud Build endpoint (`docker/make-product-smarter`)
  - GitHub API

#### Docker Buildx Cloud Build
- **Service**: Docker Cloud Build service
- **Endpoint**: `docker/make-product-smarter`
- **Purpose**: Distributed, accelerated multi-platform builds
- **Requirement**: Access to Docker's cloud build infrastructure

### Build Dependencies

#### Software Dependencies (Installed by Workflow)
- **Go**: Version 1.24.3
- **Docker**: Latest (pre-installed on GitHub runners)
- **Docker Buildx**: Lab version (latest experimental features)

#### External Images (Base Images)
The workflow pulls these base images during builds:
- `nvidia/cuda:12.9.0-runtime-ubuntu24.04` (CUDA 12.9)
- `nvidia/cuda:13.0.2-runtime-ubuntu24.04` (CUDA 13.0 for vLLM)
- `rocm/dev-ubuntu-22.04` (AMD ROCm)
- `mthreads/musa:rc4.3.0-runtime-ubuntu22.04-amd64` (Moore Threads MUSA)
- `ascendai/cann:8.2.rc2-910b-ubuntu22.04-py3.11` (Huawei Ascend CANN)

#### Repository Requirements
- **Dockerfile**: Must exist in repository root with multi-stage targets:
  - `final-llamacpp`: llama.cpp-based builds
  - `final-vllm`: vLLM-based builds
  - `final-sglang`: SGLang-based builds
- **Go Test Suite**: Must be present and executable via `go test ./...`
- **Go Modules**: `go.mod` and `go.sum` for dependency management

### Workflow Inputs (Manual Trigger)

The workflow uses `workflow_dispatch` (manual trigger) with these configurable inputs:

1. **`releaseTag`** (string, default: `"test"`)
   - Specifies the version tag for the release
   - Example: `"v1.0.0"`, `"0.5.2"`, `"2024-01-09"`

2. **`pushLatest`** (boolean, default: `false`)
   - Controls whether to tag images as `:latest`
   - Should be `true` for production releases, `false` for testing

3. **`llamaServerVersion`** (string, default: `"latest"`)
   - Version of llama.cpp server to include in images
   - Example: `"b1234"`, `"latest"`, `"stable"`

4. **`vllmVersion`** (string, default: `"0.12.0"`)
   - Version of vLLM framework to use
   - Example: `"0.12.0"`, `"0.11.5"`

5. **`sglangVersion`** (string, default: `"0.4.0"`)
   - Version of SGLang framework to use
   - Example: `"0.4.0"`, `"0.3.5"`

6. **`buildMusaCann`** (boolean, default: `false`)
   - Enable building experimental MUSA and CANN images
   - Should be `true` only when llama.cpp supports these platforms

### Execution Flow

#### Triggering the Workflow
1. Navigate to GitHub Actions tab
2. Select "Release model-runner images for CE" workflow
3. Click "Run workflow"
4. Configure input parameters
5. Click "Run workflow" button

#### Expected Execution Time
- **Test Job**: 2-5 minutes (depending on test suite size)
- **Build Job**: 20-60 minutes (depending on number of variants and build complexity)
- **Total**: ~30-70 minutes for full release

#### Success Criteria
✅ All tests pass  
✅ All 7 image variants build successfully  
✅ Images pushed to DockerHub with correct tags  
✅ SBOM and provenance metadata attached  

#### Failure Scenarios
❌ **Test Failure**: Build job never runs, no images published  
❌ **Build Failure**: Specific variant fails, workflow marked as failed  
❌ **Authentication Failure**: Cannot push to DockerHub  
❌ **Cloud Build Unavailable**: Builds fail to start  

---

## 5. Security and Supply Chain Features

### Software Bill of Materials (SBOM)
- **Enabled**: `sbom: true` on all builds
- **Format**: SPDX or CycloneDX (Docker default)
- **Purpose**: Document all software components in the image
- **Benefit**: Vulnerability scanning, compliance, transparency

### Build Provenance
- **Mode**: `provenance: mode=max`
- **Purpose**: Cryptographically sign build metadata
- **Includes**:
  - Source repository and commit SHA
  - Build platform and environment
  - Build instructions and parameters
  - Builder identity
- **Benefit**: Verify image authenticity, detect tampering

### Action Pinning
- **Strategy**: All actions pinned to specific SHAs (not tags)
- **Example**: `actions/checkout@8e8c483...` instead of `actions/checkout@v4`
- **Benefit**: Prevent supply chain attacks via compromised action tags

### Secret Management
- **Secrets**: Stored in GitHub Secrets (encrypted at rest)
- **Usage**: Only exposed to workflow during execution
- **Scope**: Organization-level secret (`ORG_ACCESS_TOKEN`)

---

## 6. Architecture and Design Patterns

### Multi-Stage Dockerfile Pattern
The workflow relies on a Dockerfile with multiple build targets:
- **`final-llamacpp`**: Base llama.cpp server
- **`final-vllm`**: vLLM-optimized variant
- **`final-sglang`**: SGLang-optimized variant

**Benefit**: Single Dockerfile, multiple specialized outputs

### Matrix Build Pattern (Implicit)
While not using GitHub's matrix strategy, the workflow achieves similar results by:
- Running 7 separate build steps
- Each with different configurations
- Parallelized by Docker Buildx

**Alternative**: Could be refactored to use matrix strategy for DRY principle

### Quality Gate Pattern
```
Test (Quality Gate) → Build (Production)
```
- Tests must pass before any images are built
- Prevents publishing broken releases
- Fails fast to save resources

### Conditional Building
- MUSA and CANN images only build when explicitly requested
- Allows gradual rollout of experimental features
- Reduces build time for standard releases

---

## 7. Hardware Platform Support Matrix

| Platform | Architecture | Inference Engine | Base Image | GPU/NPU Vendor |
|----------|--------------|------------------|------------|----------------|
| CPU | amd64, arm64 | llama.cpp | Ubuntu | N/A |
| CUDA | amd64, arm64 | llama.cpp | NVIDIA CUDA 12.9 | NVIDIA |
| vLLM-CUDA | amd64, arm64 | vLLM | NVIDIA CUDA 13.0 | NVIDIA |
| SGLang-CUDA | amd64 | SGLang | NVIDIA CUDA 12.9 | NVIDIA |
| ROCm | amd64 | llama.cpp | AMD ROCm | AMD |
| MUSA | amd64 | llama.cpp | Moore Threads MUSA | Moore Threads |
| CANN | amd64, arm64 | llama.cpp | Ascend CANN | Huawei |

---

## 8. Potential Improvements and Considerations

### Suggested Enhancements

#### 1. Matrix Strategy Refactoring
Convert the 7 separate build steps into a matrix strategy:
```yaml
strategy:
  matrix:
    variant: [cpu, cuda, vllm-cuda, sglang-cuda, rocm, musa, cann]
```
**Benefit**: Reduce code duplication, easier maintenance

#### 2. Build Time Optimization
- Add Docker layer caching
- Use GitHub Actions cache for Go dependencies
- Parallel job execution for independent builds

#### 3. Vulnerability Scanning
Add a security scanning step:
```yaml
- name: Scan image
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ steps.tags.outputs.cpu }}
```

#### 4. Notification on Failure
Add Slack/Discord notifications for failed releases

#### 5. Changelog Generation
Automatically generate changelog from commits since last release

### Considerations

#### Resource Usage
- Building 7 multi-platform images is resource-intensive
- Consider splitting into separate workflows for different variants
- Monitor Docker Cloud Build quotas

#### Version Management
- Current default (`"test"`) suggests this is not production-ready
- Consider using semantic versioning
- Automate version bumping

#### Documentation
- Add workflow documentation to repository
- Document how to test images locally before release
- Create runbook for handling failed releases

---

## 9. Summary and Key Takeaways

### What This Workflow Does
✅ Automates building 7 Docker image variants for LLM inference  
✅ Supports 5 different GPU/NPU platforms (NVIDIA, AMD, Moore Threads, Huawei)  
✅ Integrates 3 different inference engines (llama.cpp, vLLM, SGLang)  
✅ Implements quality gates via automated testing  
✅ Includes supply chain security features (SBOM, provenance)  
✅ Enables flexible versioning and tagging strategies  

### Critical Dependencies
🔑 DockerHub authentication (`ORG_ACCESS_TOKEN`)  
🔑 Docker Cloud Build access  
🔑 Multi-stage Dockerfile with correct targets  
🔑 Go test suite for quality validation  
🔑 Access to various base images (NVIDIA, AMD, etc.)  

### Best Practices Demonstrated
⭐ Action SHA pinning for security  
⭐ SBOM and provenance for supply chain integrity  
⭐ Quality gates before production builds  
⭐ Multi-platform support for broad compatibility  
⭐ Conditional builds for experimental features  
⭐ Separation of test and build concerns  

### Use Cases
This workflow is ideal for:
- Organizations building LLM inference infrastructure
- Teams supporting multiple GPU vendors
- Projects requiring reproducible, secure Docker builds
- Products serving diverse hardware environments

---

## Appendix: Workflow Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│                     WORKFLOW TRIGGER                            │
│  (Manual: workflow_dispatch with 6 configurable inputs)         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       JOB 1: TEST                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. Checkout code                                         │   │
│  │ 2. Setup Go 1.24.3                                       │   │
│  │ 3. Run tests (go test ./...)                             │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                        (If tests pass)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       JOB 2: BUILD                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. Checkout code                                         │   │
│  │ 2. Format tags (bash script - 7 variants)               │   │
│  │ 3. Login to DockerHub                                    │   │
│  │ 4. Setup Docker Buildx (cloud build)                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────── Build CPU Image ──────────────────────┐   │
│  │ Platforms: amd64, arm64 | Engine: llama.cpp             │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌─────────────────── Build CUDA Image ─────────────────────┐   │
│  │ Platforms: amd64, arm64 | Engine: llama.cpp + CUDA      │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌─────────────────── Build vLLM-CUDA Image ────────────────┐   │
│  │ Platforms: amd64, arm64 | Engine: vLLM + CUDA 13.0      │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌─────────────────── Build SGLang-CUDA Image ──────────────┐   │
│  │ Platforms: amd64 | Engine: SGLang + CUDA 12.9           │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌─────────────────── Build ROCm Image ─────────────────────┐   │
│  │ Platforms: amd64 | Engine: llama.cpp + ROCm              │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌─────────────────── Build MUSA Image (conditional) ───────┐   │
│  │ Platforms: amd64 | Engine: llama.cpp + MUSA              │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌─────────────────── Build CANN Image (conditional) ───────┐   │
│  │ Platforms: amd64, arm64 | Engine: llama.cpp + CANN       │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  DOCKERHUB REPOSITORY                           │
│  docker/model-runner:{version}[-variant]                        │
│  (With SBOM and provenance attestations)                        │
└─────────────────────────────────────────────────────────────────┘
```

---

**Document Version**: 1.0  
**Last Updated**: January 9, 2026  
**Maintainer**: AI Integration Platform Team  
**Related Files**: `.github/workflows/docker-model-runner-release.yml` (reference copy)
