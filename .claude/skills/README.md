# Claude Skills Directory

This directory contains auto-generated SKILL files that help Claude Code understand the codebase patterns and conventions.

## What are SKILL files?

SKILL files are structured markdown documents that describe:
- **Patterns**: Architectural and code patterns used in the codebase
- **Examples**: Real code examples from the project
- **Rules**: Best practices and conventions to follow
- **Triggers**: Keywords that activate the skill when mentioned

## Generated Skills

This project currently has the following skills:

### 1. Custom Hooks (`custom-hooks/`)
**Trigger keywords:** custom-hooks, react patterns, custom hooks

React custom hooks pattern for reusable stateful logic. Use when creating hooks, managing state, or extracting component logic.

**Files covered:** `src/hooks/`

### 2. Service Layer (`service-layer/`)
**Trigger keywords:** service-layer, architecture, service layer

Service layer pattern for API integration and business logic. Use when implementing services, API clients, or data management.

**Files covered:** `src/lib/`

### 3. UI Components (`ui-components/`)
**Trigger keywords:** ui-components, ui patterns, ui components

UI component patterns using Radix UI and shadcn/ui. Use when building UI components, design systems, or component libraries.

**Files covered:** `src/components/ui/`

### 4. Type Definitions (`type-definitions/`)
**Trigger keywords:** type-definitions, typescript patterns, type definitions

TypeScript type definition patterns for type safety. Use when defining types, interfaces, or type utilities.

**Files covered:** `src/types/`

## How Skills Work

When you interact with Claude Code, mentioning trigger keywords will automatically activate the relevant skill. Claude will then:

1. Reference the pattern examples
2. Follow the documented rules
3. Apply the same coding conventions
4. Generate consistent code

## Skill Structure

Each SKILL.md file follows this structure:

```markdown
---
name: skill-name
description: Brief description with trigger keywords
version: 1.0.0
---

# Skill Title

## Overview
What this skill covers

## File Structure
Where files are located

## Implementation Pattern
Real code examples

## Rules
### Do
- Best practices

### Don't
- Anti-patterns

## File Location
Actual paths from codebase

<!-- Generated marker with version and sources -->
```

## Version Management

Skills are versioned using semantic versioning:
- **Major**: Breaking changes to the pattern
- **Minor**: New features or examples added
- **Patch**: Bug fixes or clarifications

## Regenerating Skills

To update skills based on codebase changes:

```bash
# Discover new patterns
npm run skill-master:discover

# Generate/update skills
npm run skill-master:generate
```

## Customization

Skills are auto-generated but can be customized:

1. **First generation**: Original file is backed up to `.bak`
2. **Custom sections**: Add your own sections (they'll be preserved)
3. **Rules**: Edit rules from `.ruler/*.md` files
4. **Examples**: Skills automatically extract real code examples

## Generated vs Custom

- **Generated sections** (updated automatically):
  - Overview
  - File Structure
  - Implementation Pattern
  - File Location
  - Marker comment

- **Custom sections** (preserved on update):
  - Any section you add manually
  - Modified rule descriptions
  - Additional context

## Rules Integration

Skills automatically integrate rules from `.ruler/` directory:

- `typescript-standards.md` → TypeScript best practices
- `react-guidelines.md` → React component guidelines

Add more `.md` files to `.ruler/` to expand the rules.

## Safety

Skills are:
- ✅ Auto-generated from real codebase patterns
- ✅ Versioned for tracking changes
- ✅ Backed up before modification
- ✅ Free of secrets and credentials
- ✅ Updated to stay in sync with code

## Best Practices

1. **Keep skills updated**: Run `npm run skill-master:generate` after major changes
2. **Add custom context**: Enhance generated skills with project-specific details
3. **Use trigger keywords**: Mention skill names in conversations with Claude
4. **Review generated content**: Check skills after generation
5. **Maintain .ruler files**: Update rule files as conventions evolve

## Integration with Development

Skills integrate with:
- **Claude Code**: Automatic activation via trigger keywords
- **Documentation**: Real code examples from codebase
- **Code Review**: Consistent pattern enforcement
- **Onboarding**: Quick understanding of codebase patterns

## Troubleshooting

### Skill not activating
- Use specific trigger keywords from skill description
- Mention the skill name explicitly
- Check that SKILL.md file exists and is valid

### Outdated examples
- Run `npm run skill-master:generate` to refresh
- Check that source files still exist
- Verify pattern detection logic

### Missing patterns
- Run `npm run skill-master:discover` to see gaps
- Check if files match expected locations
- Review platform detection logic

## Learn More

For detailed information about the skill-master system:
- See `docs/SKILL_MASTER.md` for complete documentation
- Check `references/*.md` for platform-specific patterns
- Review `src/lib/skill-master.ts` for implementation

---

**Auto-generated directory** - Skills are created and updated by the skill-master tool.

Last updated: 2026-02-13
