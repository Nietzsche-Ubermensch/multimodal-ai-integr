# Code Reviewer Subagent

This repository includes a code reviewer subagent script located at `scripts/code-reviewer.ts`.

## Prerequisites

- Node.js
- `OPENAI_API_KEY` environment variable must be set.

## Usage

You can run the reviewer using the npm script:

```bash
export OPENAI_API_KEY=your_key_here
npm run review "Review the changes in src/App.tsx"
```

## Features

The agent has access to the following tools:
- `read_file`: Read file contents.
- `grep`: Search for patterns in files.
- `glob`: Find files by name.

## Workflow

When Jules (the AI agent) modifies code, this tool can be used to verify changes for quality and security.
