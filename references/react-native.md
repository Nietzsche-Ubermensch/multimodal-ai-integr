# React Native Platform Reference

## Detection

**Files:** `package.json` with `react-native` dependency, `app.json`, `metro.config.js`

## Common Patterns

### Navigation
- React Navigation
- React Native Navigation

**Indicators:**
- `@react-navigation/*` imports
- Navigation containers
- Stack, Tab, Drawer navigators

### State Management
- Redux/Redux Toolkit
- Zustand
- Context API
- React Query

**Indicators:**
- Store configuration
- Provider setup in App.tsx
- Hook usage patterns

### UI Components
- React Native built-ins
- React Native Paper
- Native Base
- UI Kitten

**Indicators:**
- `View`, `Text`, `TouchableOpacity` imports
- Custom component libraries
- Style prop usage

### Platform-Specific Code
- Platform.select
- Platform.OS checks
- .ios.tsx, .android.tsx files

**Indicators:**
- Platform module usage
- Conditional rendering by platform
- Platform-specific file extensions

## Source Locations

**React Native structure:**
```
src/
├── screens/                # Screen components
├── components/             # Reusable components
├── navigation/             # Navigation setup
├── store/                  # State management
├── services/               # API services
├── hooks/                  # Custom hooks
├── utils/                  # Utilities
└── types/                  # TypeScript types
```

## Architectural Patterns

### Component Organization
- Feature-based structure
- Atomic design
- Container/Presentational

### Code Conventions
- PascalCase for components
- camelCase for functions/hooks
- TypeScript for type safety
- StyleSheet.create for styles

### React Native Specifics
- Navigation patterns
- Async storage
- Native modules
- Performance optimization

## Skill Discovery Hints

Look for:
- Screen components
- Navigation configuration
- Custom hooks for mobile features
- Platform-specific implementations
- API integration patterns
- State management setup
- Custom native modules
- Animation patterns (Reanimated, Lottie)
