# React Component Guidelines

## Overview

Best practices for React components in this project.

## Do

- Use functional components with hooks
- Destructure props in function signature
- Define Props interfaces with clear names ({ComponentName}Props)
- Use TypeScript for all components
- Keep components focused on single responsibility
- Extract complex logic into custom hooks
- Use React.memo for expensive components
- Implement error boundaries for component trees
- Add prop validation with TypeScript interfaces
- Name event handlers with 'handle' prefix (handleClick, handleSubmit)

## Don't

- Use class components (unless required for error boundaries)
- Prop drill more than 2 levels deep (use context or state management)
- Perform side effects directly in render
- Ignore key prop warnings in lists
- Mutate props or state directly
- Mix business logic with presentation logic
- Create components over 200 lines (split into smaller components)
- Use index as key in dynamic lists
- Forget cleanup in useEffect hooks
- Use inline function definitions in JSX (causes re-renders)

## State Management

- Use useState for local component state
- Use useEffect with proper dependency arrays
- Use useCallback/useMemo for performance optimization
- Extract complex state logic into custom hooks
- Use Context API for shared state (small scope)
- Consider state management libraries for complex state

## Component Structure

Order of component sections:
1. Imports
2. Types/Interfaces
3. Component function
4. Hooks (useState, useEffect, etc.)
5. Event handlers
6. Render logic
7. Export

## Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use semantic color tokens (bg-background, text-foreground)
- Keep className strings readable (use clsx/cn for conditionals)

## Accessibility

- Use semantic HTML elements
- Include ARIA labels for interactive elements
- Ensure keyboard navigation support
- Test with screen readers
- Provide text alternatives for images

---

Last updated: 2026-02-13
