# Platform References Index

This directory contains platform-specific references for skill-master pattern detection.

## Available References

### Web & JavaScript

- **[react-web.md](./react-web.md)** - React web applications
  - Detection: `package.json` with `react` dependency
  - Patterns: Hooks, components, state management, UI libraries

- **[node.md](./node.md)** - Node.js backend applications
  - Detection: `package.json` without framework indicators
  - Patterns: Express, API routes, services, databases

- **[typescript.md](./typescript.md)** - TypeScript projects
  - Detection: `tsconfig.json`
  - Patterns: Type definitions, interfaces, generics

- **[react-native.md](./react-native.md)** - React Native mobile apps
  - Detection: `package.json` with `react-native`
  - Patterns: Navigation, platform-specific code, native modules

### Systems Languages

- **[go.md](./go.md)** - Go applications
  - Detection: `go.mod`
  - Patterns: Web frameworks, goroutines, interfaces

- **[rust.md](./rust.md)** - Rust applications
  - Detection: `Cargo.toml`
  - Patterns: Ownership, async/await, error handling

### Mobile

- **[android.md](./android.md)** - Android applications
  - Detection: `build.gradle`, `AndroidManifest.xml`
  - Patterns: ViewModels, Room, Jetpack Compose, Hilt

### Other Languages

- **[python.md](./python.md)** - Python applications
  - Detection: `pyproject.toml`, `requirements.txt`
  - Patterns: Django, Flask, FastAPI, data science

### Fallback

- **[generic.md](./generic.md)** - Generic/unknown platforms
  - Detection: Used when no specific platform detected
  - Patterns: Common design patterns, testing, organization

## How References Work

When skill-master detects a platform, it:

1. **Reads the reference file** for that platform
2. **Uses pattern hints** to scan the codebase
3. **Extracts conventions** from the reference
4. **Generates SKILL files** based on detected patterns

## Adding New References

To add a new platform:

1. Create a markdown file: `references/platform-name.md`
2. Follow the structure of existing references:
   - Detection section (how to identify platform)
   - Common Patterns (what to look for)
   - Source Locations (typical directory structure)
   - Architectural Patterns (code conventions)
   - Skill Discovery Hints (specific patterns to detect)
3. Update `src/lib/skill-master.ts` PLATFORMS array
4. Add detection logic if needed

## Structure Template

```markdown
# Platform Name Reference

## Detection
**Files:** list of detection files

## Common Patterns
### Pattern Category
- Pattern description
**Indicators:**
- How to detect this pattern

## Source Locations
**Typical structure:**
\`\`\`
directory/
├── folder/
└── files
\`\`\`

## Architectural Patterns
### Pattern Name
- Description

### Code Conventions
- Convention list

## Skill Discovery Hints
Look for:
- Specific files or patterns
```

## Usage

References are automatically loaded by skill-master:

```bash
# Discover patterns (reads references)
npm run skill-master:discover

# Generate skills (uses reference hints)
npm run skill-master:generate
```

## Contributing

When adding or updating references:

1. Keep descriptions concise
2. Include real-world examples
3. Focus on patterns, not tools
4. Document file locations
5. Add detection indicators
6. Test with actual projects

## See Also

- [SKILL_MASTER.md](../docs/SKILL_MASTER.md) - Full skill-master documentation
- [.claude/skills/README.md](../.claude/skills/README.md) - Generated skills documentation
- [src/lib/skill-master.ts](../src/lib/skill-master.ts) - Implementation

---

Last updated: 2026-02-13
