# Contributing

Thank you for your interest in contributing to the Multimodal AI Integration Platform! This guide will help you get started.

## Development Setup

### Prerequisites
- Node.js 20+ with npm
- Git
- Code editor (VS Code recommended)

### Local Setup
```bash
# Clone repository
git clone https://github.com/Nietzsche-Ubermensch/multimodal-ai-integr.git
cd multimodal-ai-integr

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your API keys to .env (see ENV_SETUP.md)

# Start development server
npm run dev  # Frontend at http://localhost:5173

# Start API gateway (optional)
cd api-gateway
npm install
npm run dev  # Backend at http://localhost:3000
```

### Verify Installation
```bash
npm run build  # Should complete without errors
npm run lint   # Should pass all checks
npm test       # Should pass all tests
```

## Branching Strategy

**Main Branches**
- `main`: Production-ready code, protected with required reviews
- `develop`: Integration branch (if applicable)

**Feature Branches**
- Format: `feature/<short-description>`
- Example: `feature/add-gemini-provider`
- Branch from: `main`
- Merge into: `main` via pull request

**Bug Fix Branches**
- Format: `bugfix/<issue-description>`
- Example: `bugfix/fix-streaming-error`

**Hotfix Branches**
- Format: `hotfix/<critical-issue>`
- For urgent production fixes only

## Commit Message Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

**Examples**
```bash
feat(api-gateway): add Gemini provider integration
fix(rag): resolve chunking overlap calculation error
docs(readme): update installation instructions
refactor(ui): extract ModelCard component
test(ai-service): add unit tests for cost calculation
```

## Pull Request Guidelines

### Before Opening a PR
1. Update from main: `git pull origin main`
2. Run linter: `npm run lint`
3. Run type checker: `tsc --noEmit`
4. Run tests: `npm test`
5. Test manually in browser

### PR Template
- **Title**: Clear, descriptive (matches commit format)
- **Description**: What changed and why
- **Testing**: How you tested the changes
- **Screenshots**: For UI changes
- **Breaking Changes**: Call out any breaking changes
- **Related Issues**: Link to issue numbers

### Review Process
- At least 1 approval required
- All CI checks must pass
- Address all review comments
- Keep PR scope focused and small

## Code Style & Linting

### TypeScript Standards
- **Strict Mode**: Enabled (`strictNullChecks`)
- **Explicit Types**: All function parameters and returns
- **No `any`**: Use `unknown` with type guards
- **Path Aliases**: Use `@/` for imports (not relative paths)

### React Patterns
- **Functional Components**: No class components
- **TypeScript Props**: Interface named `{Component}Props`
- **Hooks**: Follow React hooks rules
- **Event Handlers**: Prefix with `handle`

### Linting
```bash
npm run lint        # Check for errors
npm run lint --fix  # Auto-fix issues
```

Configuration: `eslint.config.js` with TypeScript ESLint

## Testing Requirements

### Unit Tests
- Write tests for new functions/utilities
- Use Vitest framework
- Place tests in `tests/` directory
- Filename: `{feature}.test.ts`

### Component Tests
- Use Testing Library (React)
- Test user interactions, not implementation
- Include accessibility tests

### Running Tests
```bash
npm test           # Watch mode
npm test -- --run  # Single run
```

## Documentation Requirements

### Code Documentation
- **JSDoc Comments**: For public functions/classes
- **Type Definitions**: Shared types in `src/types/`
- **README Updates**: For new features

### Updating Documentation
When adding significant features, update:
- `README.md`: If changing setup/usage
- `ARCHITECTURE.md`: If adding new components
- `docs/`: Detailed guides as needed
- Inline code comments for complex logic

## Review & Approval Process

### Review Checklist
- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Linter passes
- [ ] Documentation updated
- [ ] No security vulnerabilities introduced
- [ ] Changes are minimal and focused

### Reviewer Responsibilities
- Review within 48 hours
- Provide constructive feedback
- Test changes locally if needed
- Approve only when all checks pass

### Merging
- **Squash and Merge**: For feature branches
- **Delete Branch**: After merge (automatic)
- **No Force Push**: On main branch

## Questions or Issues?

- **Questions**: Open a discussion on GitHub
- **Bugs**: Create an issue with reproduction steps
- **Feature Requests**: Open an issue with use case description
- **Security Issues**: Email maintainers directly (see SECURITY.md)

Thank you for contributing! 🚀
