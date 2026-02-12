# GitHub Copilot Instructions

This directory contains GitHub Copilot customizations for this repository, organized into three content file types.

## Directory Structure

```
.github/
├── copilot-instructions.md     # Legacy repository-wide instructions (kept for compatibility)
├── instructions/                # Modern instruction files
│   ├── reactjs.instructions.md
│   ├── nodejs-javascript-vitest.instructions.md
│   ├── playwright-typescript.instructions.md
│   ├── security-and-owasp.instructions.md
│   └── a11y.instructions.md
├── prompts/                     # Prompt files (pattern-based activation)
└── agents/                      # Agent files (user-invoked modes)
```

## Content File Types

### Instructions (`instructions/*.instructions.md`)

Provides background knowledge and guidelines consumed as contextual reference material via `applyTo` patterns.

**Installed Instructions:**
- **reactjs.instructions.md** - React 19+ development standards, hooks, TypeScript, testing, accessibility
- **typescript.instructions.md** - TypeScript 5.7+ development with strict type safety and modern patterns
- **nodejs-javascript-vitest.instructions.md** - Node.js/JavaScript coding standards with Vitest testing
- **playwright-typescript.instructions.md** - Playwright TypeScript test generation guidelines
- **security-and-owasp.instructions.md** - OWASP Top 10 secure coding practices
- **a11y.instructions.md** - WCAG 2.2 Level AA accessibility guidelines
- **context-engineering.instructions.md** - Maximize Copilot effectiveness through better context management

### Prompts (`prompts/*.prompt.md`)

Pattern-based consumption with frontmatter + body structure. Activates automatically based on file patterns and context matching.

**Installed Prompts:**
- None yet - prompts can be added as needed

### Agents (`agents/*.agent.md`)

User-invoked modes requiring explicit slash commands. Implements MCR (Multi-turn Conversational Reasoning) integration.

**Installed Agents:**
- None yet - agents can be added as needed

## Installation

Instructions and prompts are automatically consumed by GitHub Copilot when files match their `applyTo` patterns. No manual installation required.

### Manual Installation (VS Code)

For prompts and agents that require explicit installation, use the install buttons in the [awesome-copilot collections](https://github.com/github/awesome-copilot/tree/main/collections).

## Tech Stack Coverage

Current instructions cover:

- ✅ React 19+ (functional components, hooks, TypeScript, testing)
- ✅ TypeScript 5.7+ (strict type safety, generics, discriminated unions)
- ✅ Node.js/JavaScript (ES2022+, Vitest, async/await)
- ✅ Testing (Vitest unit tests, Playwright e2e, React Testing Library)
- ✅ Security (OWASP Top 10, secure coding, XSS/injection prevention)
- ✅ Accessibility (WCAG 2.2 Level AA, semantic HTML, ARIA)
- ✅ Context Engineering (project structure, multi-file changes)
- ✅ Frontend (Vite, Tailwind CSS, Radix UI, shadcn/ui)

## Customization

### Adding Instructions

1. Create a new `.instructions.md` file in `.github/instructions/`
2. Add frontmatter with `description` and `applyTo` patterns:
   ```markdown
   ---
   description: 'Brief description'
   applyTo: '**/*.ext'
   ---
   
   # Instruction Title
   
   Your instructions here...
   ```

### Adding Prompts

1. Create a new `.prompt.md` file in `.github/prompts/`
2. Add frontmatter with metadata and activation patterns
3. Define prompt behavior in body

### Adding Agents

1. Create a new `.agent.md` file in `.github/agents/`
2. Add frontmatter with `description`, `name`, and `tools`
3. Define agent persona and capabilities

## Recommended Collections

Based on repository analysis, consider adding from [awesome-copilot](https://github.com/github/awesome-copilot):

- **Frontend Web Development** - Additional React/TypeScript/CSS resources
- **TypeScript MCP Server Development** - For building MCP servers
- **Testing & Test Automation** - TDD practices, additional testing patterns
- **Context Engineering** - Maximizing Copilot effectiveness
- **Security & Code Quality** - Performance optimization, code quality
- **Awesome Copilot** - Meta prompts for discovering resources

## Resources

- [Best practices for Copilot coding agent](https://gh.io/copilot-coding-agent-tips)
- [awesome-copilot Collections](https://github.com/github/awesome-copilot/tree/main/collections)
- [GitHub Copilot Documentation](https://docs.github.com/copilot)

## Maintenance

Instructions should be:
- Reviewed periodically to ensure alignment with project standards
- Updated when major framework/library versions change
- Extended when new technologies are adopted
- Removed when technologies are deprecated

## Summary

This repository now has 7 comprehensive instruction files covering:
- Frontend development (React 19+, TypeScript 5.7+)
- Backend development (Node.js, Express.js)
- Testing strategies (Vitest, Playwright)
- Security best practices (OWASP Top 10)
- Accessibility compliance (WCAG 2.2 AA)
- Context engineering for better AI assistance

All instructions are automatically consumed by GitHub Copilot based on file patterns.

Last updated: 2026-02-12
