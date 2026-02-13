# React Web Platform Reference

## Detection

**Files:** `package.json` with `"react"` dependency (without `react-native`)

## Common Patterns

### Component Patterns
- Functional components with hooks
- Class components (legacy)
- Higher-order components (HOC)
- Render props
- Compound components

**Indicators:**
- Files ending in `.tsx`, `.jsx`
- Imports from `react`, `react-dom`
- Use of hooks: `useState`, `useEffect`, `useContext`, etc.
- Component exports

### State Management
- React Context API
- Redux/Redux Toolkit
- Zustand
- Jotai
- Recoil
- TanStack Query (React Query)

**Indicators:**
- `createContext`, `useContext`
- `configureStore`, `createSlice`
- Store/context providers in file names
- `@tanstack/react-query`

### UI Component Libraries
- Radix UI
- shadcn/ui
- Material-UI
- Ant Design
- Chakra UI

**Indicators:**
- `@radix-ui/*` imports
- `@/components/ui/*` path pattern
- `components.json` (shadcn/ui)

### Styling Patterns
- Tailwind CSS
- CSS Modules
- Styled Components
- Emotion
- CSS-in-JS

**Indicators:**
- `tailwind.config.js`
- `.module.css` files
- `styled` imports

### Build Tools
- Vite
- Webpack
- Create React App
- Next.js

**Indicators:**
- `vite.config.ts/js`
- `webpack.config.js`
- `next.config.js`

## Source Locations

**Typical structure:**
```
src/
├── components/     # React components
├── hooks/          # Custom hooks
├── lib/            # Utilities and services
├── types/          # TypeScript types
├── styles/         # Global styles
└── App.tsx         # Root component
```

## Architectural Patterns

### Component Organization
- Atomic design (atoms, molecules, organisms)
- Feature-based (features/*)
- Domain-driven (domains/*)

### Code Conventions
- PascalCase for components
- camelCase for functions/variables
- Props interfaces named `{ComponentName}Props`
- Custom hooks prefixed with `use`

### TypeScript Patterns
- Props typing with interfaces
- Generics for reusable components
- Type-safe event handlers
- Union types for variants

## Skill Discovery Hints

Look for:
- Custom hooks in `hooks/` or `src/hooks/`
- Service layers in `lib/`, `services/`, `api/`
- Type definitions in `types/`, `@types/`
- UI components in `components/ui/`
- Feature components in `components/`
- Context providers
- HOCs and utilities
- Form handling patterns
- API integration patterns
- Error boundaries
- Routing patterns (React Router)
