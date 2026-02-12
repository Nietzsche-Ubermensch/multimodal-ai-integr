---
description: 'TypeScript development standards with strict type safety and modern patterns'
applyTo: '**/*.ts, **/*.tsx, **/*.d.ts'
---

# TypeScript Development Instructions

Guidelines for writing high-quality TypeScript code with strict type safety, modern patterns, and best practices.

## TypeScript Version & Configuration

- Use TypeScript 5.7+ with latest features
- Enable strict mode in `tsconfig.json` (`strict: true`)
- Enable `strictNullChecks` for null safety
- Use `noUncheckedIndexedAccess` to prevent index access errors
- Set `target: "ES2020"` or higher for modern JavaScript features
- Use `moduleResolution: "bundler"` for Vite/modern bundlers

## Type Safety Principles

### Explicit Types Over Inference
- Always type function parameters and return values
- Use explicit types for complex objects and arrays
- Type event handlers explicitly (e.g., `React.MouseEvent<HTMLButtonElement>`)
- Define types for props, state, and component definitions

```typescript
// ✅ Good - Explicit types
function fetchUser(userId: string): Promise<User> {
  return fetch(`/api/users/${userId}`).then(res => res.json());
}

// ❌ Avoid - Implicit types
function fetchUser(userId) {
  return fetch(`/api/users/${userId}`).then(res => res.json());
}
```

### Type vs Interface
- Use `interface` for object shapes and API contracts
- Use `type` for unions, intersections, and mapped types
- Prefer `interface` for extensibility (can be extended via declaration merging)
- Use `type` for computed properties and complex transformations

```typescript
// Interface for extensible objects
interface User {
  id: string;
  name: string;
  email: string;
}

// Type for unions and computed types
type APIProvider = 'openrouter' | 'anthropic' | 'openai' | 'deepseek';
type ReadonlyUser = Readonly<User>;
```

### Null Safety
- Always handle null/undefined explicitly
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Avoid using `!` (non-null assertion) unless absolutely necessary
- Use type guards for runtime null checks

```typescript
// ✅ Good - Null-safe access
const name = user?.name ?? 'Unknown';
const apiKey = config.providers.openai ?? undefined;

// ❌ Avoid - Non-null assertion
const name = user!.name;
```

## Advanced TypeScript Patterns

### Generic Functions and Components
- Use generics for reusable, type-safe functions and components
- Constrain generics with `extends` when needed
- Provide default type parameters where appropriate

```typescript
// Generic function with constraints
function mapArray<T, U>(
  array: T[],
  transform: (item: T) => U
): U[] {
  return array.map(transform);
}

// Generic React component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map(renderItem)}</ul>;
}
```

### Discriminated Unions
- Use discriminated unions for state machines and variant types
- Include a discriminant property (e.g., `type`, `kind`, `status`)
- Exhaustiveness checking with `never` type

```typescript
// Discriminated union for API response
type APIResponse<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

function handleResponse<T>(response: APIResponse<T>) {
  switch (response.status) {
    case 'loading':
      return <Spinner />;
    case 'success':
      return <div>{response.data}</div>;
    case 'error':
      return <Error message={response.error} />;
    default:
      // Exhaustiveness check
      const _exhaustive: never = response;
      return _exhaustive;
  }
}
```

### Utility Types
- Use built-in utility types: `Partial<T>`, `Required<T>`, `Readonly<T>`, `Pick<T, K>`, `Omit<T, K>`
- Create custom utility types for domain-specific needs
- Use `ReturnType<T>` and `Parameters<T>` to extract types from functions

```typescript
// Built-in utility types
type PartialUser = Partial<User>;
type UserNameAndEmail = Pick<User, 'name' | 'email'>;
type UserWithoutId = Omit<User, 'id'>;

// Custom utility type
type Nullable<T> = T | null;
type AsyncFunction<T> = (...args: any[]) => Promise<T>;
```

## React + TypeScript Patterns

### Component Props
- Define props interfaces with clear, descriptive names
- Use `React.FC` sparingly (prefer explicit typing)
- Destructure props in function signature

```typescript
// ✅ Good - Explicit props interface
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ label, onClick, variant = 'primary', disabled }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
}

// ❌ Avoid - Generic any
export function Button(props: any) {
  // ...
}
```

### Hooks with TypeScript
- Type useState with explicit type parameter when needed
- Use type inference for simple state
- Type custom hooks return values

```typescript
// useState with explicit type
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<string[]>([]);

// Custom hook with typed return
function useApiKey(): [string | null, (key: string) => void] {
  const [apiKey, setApiKey] = useState<string | null>(null);
  return [apiKey, setApiKey];
}
```

### Event Handlers
- Type event handlers explicitly with React event types
- Use specific event types (e.g., `MouseEvent`, `ChangeEvent`, `FormEvent`)

```typescript
// Typed event handlers
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  // ...
};

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setValue(event.target.value);
};

const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  // ...
};
```

## API Integration Types

### Type-Safe API Calls
- Define request and response types for all API calls
- Use discriminated unions for API states
- Validate API responses at runtime with libraries like Zod

```typescript
// API request/response types
interface CreateUserRequest {
  name: string;
  email: string;
}

interface CreateUserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// Type-safe API function
async function createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create user');
  }
  
  return response.json();
}
```

## Module Organization

### Type Definitions
- Store shared types in `src/types/` directory
- Use `.d.ts` files for ambient declarations
- Export types from index files for clean imports

```typescript
// src/types/api.ts
export interface APIResponse<T> {
  data: T;
  status: number;
  error?: string;
}

// src/types/index.ts
export * from './api';
export * from './models';
```

### Import Paths
- Use path aliases (`@/`) for cleaner imports
- Import types with `import type` for type-only imports (tree-shaking)
- Group imports: external → internal → types → styles

```typescript
// ✅ Good - Clean imports with path alias
import { Button } from '@/components/ui/button';
import type { User } from '@/types/models';

// ❌ Avoid - Relative paths
import { Button } from '../../components/ui/button';
```

## Error Handling

### Type-Safe Errors
- Use custom error classes with proper typing
- Implement error boundaries with typed error states
- Handle async errors with try/catch and typed catch blocks

```typescript
// Custom error class
class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Type-safe error handling
async function fetchData(): Promise<Data> {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new APIError('Fetch failed', response.status);
    }
    return response.json();
  } catch (error) {
    if (error instanceof APIError) {
      console.error(`API Error ${error.statusCode}: ${error.message}`);
    } else if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('Unknown error occurred');
    }
    throw error;
  }
}
```

## Performance Optimization

### Type-Level Performance
- Avoid complex recursive types that slow compilation
- Use type aliases to reduce type computation
- Prefer simpler types over deeply nested generics

## Best Practices Checklist

- [ ] All functions have explicit parameter and return types
- [ ] Strict null checks enabled and null/undefined handled
- [ ] Union types used instead of enums
- [ ] Discriminated unions for variant types
- [ ] Generic constraints used where appropriate
- [ ] Custom error classes properly typed
- [ ] API requests/responses fully typed
- [ ] React components have typed props
- [ ] Event handlers explicitly typed
- [ ] No `any` types (use `unknown` with type guards instead)
- [ ] Type-only imports used where possible
- [ ] Path aliases configured and used consistently

## Anti-Patterns to Avoid

❌ Using `any` type
❌ Type assertions without validation (`as` keyword)
❌ Non-null assertions (`!`)
❌ Ignoring TypeScript errors with `@ts-ignore`
❌ Mixing `interface` and `type` inconsistently
❌ Using string/number instead of string/number literals
❌ Overly complex generic types
❌ Missing return types on functions
❌ Implicit `any` in function parameters
