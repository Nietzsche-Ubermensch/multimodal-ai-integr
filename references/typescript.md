# TypeScript Platform Reference

## Detection

**Files:** `tsconfig.json`

## Common Patterns

### Type Patterns
- Interface definitions
- Type aliases
- Union and intersection types
- Generic types
- Utility types (Partial, Pick, Omit, etc.)

**Indicators:**
- `.d.ts` declaration files
- `types/` or `@types/` directories
- `interface`, `type` keywords
- Generic syntax `<T>`

### TypeScript-Specific
- Strict mode configuration
- Path aliases (`@/*`)
- Declaration files
- Type guards
- Discriminated unions

**Indicators:**
- `tsconfig.json` with strict flags
- Path mapping in compilerOptions
- Type assertion patterns
- `is` type predicates

### Code Organization
- Types separated from implementation
- Shared types in dedicated directory
- Declaration modules
- Namespace organization

**Indicators:**
- `types/` directory
- `.d.ts` files
- `declare module` statements
- Triple-slash directives

## Source Locations

**Typical structure:**
```
src/
├── types/          # Type definitions
│   ├── index.ts
│   └── *.ts
├── @types/         # Custom declarations
└── *.d.ts          # Declaration files
```

## Architectural Patterns

### Type Safety
- Strict null checks
- No implicit any
- Explicit return types
- Type-safe event handling

### Code Conventions
- PascalCase for types/interfaces
- Prefix interfaces with `I` (optional)
- Suffix types with `Type` (optional)
- Use type inference where possible

## Skill Discovery Hints

Look for:
- Complex type definitions
- Utility type usage
- Generic patterns
- Type guard implementations
- Branded types
- Template literal types
- Conditional types
