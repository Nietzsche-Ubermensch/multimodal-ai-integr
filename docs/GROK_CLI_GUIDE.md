# Grok CLI Integration Guide

## Overview

[grok-cli](https://github.com/superagent-ai/grok-cli) is an open-source AI terminal assistant powered by xAI's Grok model that brings intelligent automation directly to your command line. Unlike traditional chatbots, grok-cli acts as an agentic assistant capable of real code and systems reasoning, workflow automation, and interactive file and shell operations.

This guide covers how to use grok-cli alongside the multimodal AI integration platform for a comprehensive AI development workflow.

---

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Basic Usage](#basic-usage)
5. [Integration with Platform](#integration-with-platform)
6. [Advanced Features](#advanced-features)
7. [MCP Integration](#mcp-integration)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Features

### Core Capabilities

| Feature | Description |
|---------|-------------|
| **Conversational AI** | Natural language interaction powered by Grok-3/4 |
| **Smart File Operations** | AI-driven file viewing, creation, editing, and management |
| **Bash Integration** | Execute shell commands via natural language |
| **Automatic Tool Selection** | Intelligent decision-making for built-in operations |
| **Fast Code Editing** | Optional Morph integration for rapid code changes |
| **MCP Support** | Model Context Protocol for external tool integration |
| **Interactive UI** | Live-streaming terminal interface built on Ink (React for CLI) |

### Supported Operations

- **File Management**: View, create, edit, delete files
- **Shell Commands**: Run any bash command via natural language
- **Code Generation**: Generate and modify code with context awareness
- **Project Navigation**: Search and explore codebases
- **Git Operations**: Commit, push, branch management
- **Testing**: Run and analyze test results
- **Documentation**: Generate and update docs

---

## Installation

### Prerequisites

- Node.js 18+ or Bun runtime
- xAI API key from [console.x.ai](https://console.x.ai)
- (Optional) Morph API key for fast code editing

### Using npm

```bash
# Install globally
npm install -g @vibe-kit/grok-cli

# Verify installation
grok --version
```

### Using Bun (Recommended)

```bash
# Install globally with Bun
bun install -g @vibe-kit/grok-cli

# Or run directly
bunx @vibe-kit/grok-cli
```

### Clone from Source

```bash
# Clone the repository
git clone https://github.com/superagent-ai/grok-cli.git
cd grok-cli

# Install dependencies
npm install

# Build and link
npm run build
npm link
```

---

## Configuration

### Environment Variables

Create a `.env` file or set environment variables:

```bash
# Required: xAI API Key
export XAI_API_KEY="xai-your-api-key-here"

# Optional: Morph API Key for fast code editing
export MORPH_API_KEY="morph-your-api-key-here"

# Optional: Custom model selection
export GROK_MODEL="grok-4-1-fast-reasoning"
```

### Project Configuration

Create a `.grok/GROK.md` file in your project root to provide context:

```markdown
# Project Context

## Overview
This is a TypeScript React application for AI integration.

## Tech Stack
- React 19
- TypeScript 5.7
- Tailwind CSS v4
- Vite 7

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - Run ESLint

## Conventions
- Use TypeScript strict mode
- Follow Airbnb style guide
- Use Phosphor Icons for icons
- Use shadcn/ui components
```

### Hierarchical Configuration

Grok-cli supports hierarchical configuration, looking for `.grok/GROK.md` files up the directory tree:

```
~/projects/
├── .grok/GROK.md          # Global project settings
└── my-app/
    ├── .grok/GROK.md      # App-specific overrides
    └── src/
        └── components/
            └── .grok/GROK.md  # Component-specific context
```

---

## Basic Usage

### Starting a Session

```bash
# Start interactive session
grok

# Start with a specific prompt
grok "Explain the structure of this project"

# Start with context file
grok --context ./README.md "Summarize this documentation"
```

### Common Commands

```bash
# File operations
grok "Create a new React component called UserProfile"
grok "Show me the contents of package.json"
grok "Add a new dependency for form validation"

# Code generation
grok "Write a function to validate email addresses"
grok "Refactor this file to use async/await"
grok "Add TypeScript types to this function"

# Git operations
grok "Commit these changes with a descriptive message"
grok "Create a new branch for feature X"
grok "Show me the recent commits"

# Testing
grok "Run the tests and explain any failures"
grok "Generate unit tests for the UserService"

# Documentation
grok "Update the README with new features"
grok "Generate JSDoc comments for this module"
```

### Interactive Mode

```bash
# Start interactive mode
grok

# In interactive mode:
> explain the modelhub service
> show me how to add a new AI provider
> create a test file for the api-service
> exit
```

---

## Integration with Platform

### Using grok-cli with This Platform

The grok-cli tool complements this multimodal AI platform by providing:

1. **Terminal-based Development**: Quick prototyping and file operations
2. **Code Generation**: Generate components, services, and tests
3. **Documentation Updates**: Keep docs in sync with code changes
4. **Debugging**: Analyze errors and suggest fixes

### Example Workflow

```bash
# Navigate to the project
cd multimodal-ai-integr

# Start grok-cli
grok

# Add a new model to the registry
> Add a new AI model "grok-4-turbo" to the AI_MODELS array in modelhub-service.ts

# Generate a test component
> Create a test component for the new XAI features

# Update documentation
> Update README.md to include the new grok-cli integration

# Commit changes
> Commit these changes with message "feat: add grok-4-turbo model"
```

### Complementary Tools

| Tool | Purpose | Best For |
|------|---------|----------|
| **grok-cli** | Terminal automation | Quick operations, file management |
| **Platform API Tester** | Web-based testing | Model comparison, streaming tests |
| **XAI SDK Demo** | Interactive demos | Learning, documentation |
| **OpenRouter SDK** | Multi-provider access | Production applications |

---

## Advanced Features

### Tool Calling

Grok-cli supports function/tool calling for extended capabilities:

```bash
# Web search integration
grok "Search for the latest xAI API updates"

# File system operations
grok "Find all TypeScript files that import 'openai'"

# Code analysis
grok "Analyze the complexity of the modelhub-service"
```

### Streaming Responses

```bash
# Enable streaming for long responses
grok --stream "Explain quantum computing in detail"
```

### Model Selection

```bash
# Use specific model
grok --model grok-4-1-fast-reasoning "Complex analysis task"

# Use code-optimized model
grok --model grok-code-fast-1 "Write a sorting algorithm"

# Use non-reasoning for fast responses
grok --model grok-4-1-fast-non-reasoning "What time is it in Tokyo?"
```

### Context Management

```bash
# Include specific files as context
grok --files src/lib/modelhub-service.ts,src/types/modelhub.ts "Add error handling"

# Include directory
grok --dir ./src/components "Review all components for accessibility"
```

---

## MCP Integration

### Model Context Protocol Support

Grok-cli supports MCP (Model Context Protocol) for integrating external tools:

```typescript
// .grok/mcp.config.ts
export default {
  servers: [
    {
      name: 'github',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github']
    },
    {
      name: 'filesystem',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/path/to/allowed/dir']
    }
  ]
};
```

### Available MCP Servers

| Server | Purpose | Example Use |
|--------|---------|-------------|
| **github** | GitHub operations | Create PRs, issues |
| **filesystem** | File operations | Secure file access |
| **linear** | Linear integration | Manage tasks |
| **slack** | Slack messaging | Send notifications |
| **postgres** | Database queries | Query databases |

### Example MCP Usage

```bash
# With GitHub MCP server
grok "Create a PR for these changes to the main branch"

# With Linear MCP server
grok "Create a task for implementing the new feature"
```

---

## Best Practices

### 1. Provide Clear Context

```bash
# Good: Specific and contextual
grok "In src/lib/modelhub-service.ts, add a new xAI model with 128K context"

# Less good: Vague
grok "Add a model"
```

### 2. Use Project Configuration

Create comprehensive `.grok/GROK.md` files:

```markdown
# Project: Multimodal AI Platform

## Quick Reference
- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`

## Important Files
- `src/lib/modelhub-service.ts` - Model registry
- `src/types/modelhub.ts` - Type definitions
- `src/components/` - React components

## Coding Standards
- TypeScript strict mode
- ESLint with recommended rules
- Prettier for formatting
```

### 3. Iterative Development

```bash
# Step-by-step approach
grok "First, show me the current API key validation logic"
grok "Now add validation for the new provider"
grok "Finally, add tests for the new validation"
```

### 4. Review Before Commit

```bash
# Always review changes
grok "Show me the diff of changes made"
grok "Are there any potential issues with these changes?"
```

### 5. Security Considerations

```bash
# Never include sensitive data in prompts
# ❌ Bad
grok "Update the API key to sk-abc123"

# ✅ Good
grok "Update the code to read API key from environment variable"
```

---

## Troubleshooting

### Common Issues

#### API Key Not Found

```bash
# Error: XAI_API_KEY not set
# Solution: Set the environment variable
export XAI_API_KEY="your-key-here"

# Or create .env file
echo "XAI_API_KEY=your-key-here" > .env
```

#### Rate Limiting

```bash
# Error: Rate limit exceeded
# Solution: Wait and retry, or use non-reasoning model for simple tasks
grok --model grok-4-1-fast-non-reasoning "Simple query"
```

#### Context Too Large

```bash
# Error: Context exceeds model limit
# Solution: Use selective file inclusion
grok --files src/specific-file.ts "Analyze this file"
```

#### Permission Errors

```bash
# Error: Permission denied for file operation
# Solution: Check file permissions or run with appropriate access
chmod +x ./script.sh
grok "Now run the script"
```

### Getting Help

```bash
# Show help
grok --help

# Show version
grok --version

# Report issues
# Visit: https://github.com/superagent-ai/grok-cli/issues
```

---

## Resources

### Official Links

- **Repository**: [github.com/superagent-ai/grok-cli](https://github.com/superagent-ai/grok-cli)
- **NPM Package**: [@vibe-kit/grok-cli](https://www.npmjs.com/package/@vibe-kit/grok-cli)
- **Documentation**: [grokcli.dev](https://www.grokcli.dev/)
- **xAI Console**: [console.x.ai](https://console.x.ai)

### Related Documentation

- [XAI_GROK4_DOCUMENTATION.md](./XAI_GROK4_DOCUMENTATION.md) - Complete xAI Grok API reference
- [XAI_SDK_GUIDE.md](./XAI_SDK_GUIDE.md) - Explainable AI integration
- [XAI_EXAMPLES.md](./XAI_EXAMPLES.md) - xAI code examples

### Community

- **Discord**: Join the superagent-ai community
- **GitHub Discussions**: Ask questions and share ideas

---

## Comparison: grok-cli vs Platform API

| Feature | grok-cli | Platform API |
|---------|----------|--------------|
| **Interface** | Terminal | Web UI |
| **Best For** | Quick operations | Visual testing |
| **File Operations** | Native | Via upload |
| **Streaming** | Terminal output | UI streaming |
| **Multi-model** | Single (Grok) | Multiple providers |
| **Automation** | Excellent | API-based |
| **Learning Curve** | Low | Low |

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**License**: MIT
