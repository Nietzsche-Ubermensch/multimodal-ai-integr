# TypeScript Code Standards

## Overview

This document defines the TypeScript coding standards for the project.

## Do

- Use explicit types for function parameters and return values
- Enable strict mode in tsconfig.json
- Use const for variables that won't be reassigned
- Prefer interfaces for object shapes
- Use type aliases for unions and intersections
- Implement proper error handling with try/catch
- Use async/await over raw promises
- Add JSDoc comments for public APIs
- Use path aliases (@/) for imports
- Keep functions small and focused (under 50 lines)

## Don't

- Use `any` type (use `unknown` with type guards instead)
- Ignore TypeScript errors with @ts-ignore without explanation
- Use `var` (use `const` or `let`)
- Create large monolithic files (keep under 300 lines)
- Mix multiple concerns in a single module
- Use default exports (prefer named exports)
- Ignore null/undefined checks
- Use non-null assertions (!) without verification
- Create deep import paths (use barrel exports)
- Include console.log in production code

## Type Safety

- Enable `strictNullChecks` in tsconfig
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Validate external data with runtime checks (e.g., Zod)
- Avoid type assertions unless absolutely necessary
- Use branded types for nominal typing when needed

## Architecture

- Separate concerns: types, logic, UI
- Use dependency injection for testability
- Keep business logic separate from UI code
- Use service layer for API calls
- Implement repository pattern for data access

## Testing

- Write unit tests for all business logic
- Use TypeScript in test files
- Mock external dependencies
- Aim for >80% code coverage
- Test edge cases and error conditions

---

Last updated: 2026-02-13
