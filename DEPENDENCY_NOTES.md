# Dependency Notes & Migration Guide

This document provides detailed information about major dependencies, their versions, and migration guides for breaking changes.

## Table of Contents

- [Major Dependencies Overview](#major-dependencies-overview)
- [Recent Major Updates](#recent-major-updates)
- [Migration Guides](#migration-guides)
- [Testing Recommendations](#testing-recommendations)

---

## Major Dependencies Overview

### Frontend Framework
- **React** `19.2.3` - Latest React with improved concurrent rendering and server components
- **React DOM** `19.0.0` - DOM rendering for React 19
- **TypeScript** `5.7.2` - Strict type checking enabled

### UI & Styling
- **Tailwind CSS** `4.1.11` - Latest Tailwind with new features and performance improvements
- **Radix UI** (Multiple packages) - Accessible component primitives
- **shadcn/ui** - Pre-built components using Radix UI
- **Phosphor Icons** `2.1.7` - Icon library
- **Framer Motion** `12.6.2` - Animation library

### Data Visualization
- **recharts** `3.6.0` ⚠️ (MAJOR UPDATE from 2.15.4)
  - Modern charting library built on React and D3
  - TypeScript support with improved type definitions
  - Responsive charts with animations

### Layout & Interaction
- **react-resizable-panels** `4.1.0` ⚠️ (MAJOR UPDATE from 2.1.9)
  - Resizable panel layouts
  - Keyboard-accessible
  - Customizable collapse/expand behavior

### AI & API Integration
- **OpenAI SDK** `6.15.0` - Official OpenAI API client
- **@openrouter/ai-sdk-provider** `1.5.4` - OpenRouter integration
- **Vercel AI SDK** (via `ai` in OpenRouter provider) - Streaming AI responses

### Database & Backend
- **@supabase/supabase-js** `2.89.0` - Supabase client for PostgreSQL + pgvector
- **@tanstack/react-query** `5.83.1` - Async state management

### Build Tools
- **Vite** `7.2.6` - Fast build tool and dev server
- **ESLint** `9.39.2` - Code linting
- **@vitejs/plugin-react-swc** `4.2.2` - React plugin with SWC compiler

---

## Recent Major Updates

### December 30, 2025

#### 1. react-resizable-panels: 2.1.9 → 4.1.0 (MAJOR)
**Status**: ⚠️ BREAKING CHANGES

**What Changed**:
- API behavior changes in `expand()` method
- `defaultLayout` prop handling updated
- Panel collapse/expand behavior refined

**Why Update**:
- Performance improvements
- Better keyboard accessibility
- More predictable panel behavior
- Bug fixes for edge cases

#### 2. recharts: 2.15.4 → 3.6.0 (MAJOR)
**Status**: ⚠️ BREAKING CHANGES

**What Changed**:
- TypeScript types restructured
- Animation API syntax updated
- Component prop types refined
- D3 dependency updated

**Why Update**:
- Better TypeScript support
- Performance improvements
- New features and chart types
- Security updates in D3

#### 3. react: 19.2.0 → 19.2.3 (MINOR)
**Status**: ✅ No breaking changes

**What Changed**:
- Bug fixes
- Performance optimizations

#### 4. eslint & @eslint/js: 9.39.1 → 9.39.2 (PATCH)
**Status**: ✅ No breaking changes

**What Changed**:
- Bug fixes in linting rules
- Minor rule updates

---

## Migration Guides

### react-resizable-panels v4 Migration

#### Breaking Change 1: `expand()` Method Behavior

**Before (v2.x)**:
```typescript
// expand() would expand to a specific size
panelRef.current?.expand(50); // Expand to 50%
```

**After (v4.x)**:
```typescript
// expand() now takes no parameters and expands to fill available space
panelRef.current?.expand(); // Expand to fill

// For specific sizes, use resize() instead
panelRef.current?.resize(50); // Set to 50%
```

**What to Do**:
1. Search your codebase for `expand()` calls with parameters
2. Replace with `resize()` if you need specific sizes
3. Use `expand()` without parameters if you want to fill available space

**Command to find usages**:
```bash
grep -r "\.expand\(" src/
```

#### Breaking Change 2: `defaultLayout` Prop

**Before (v2.x)**:
```typescript
<PanelGroup>
  <Panel defaultLayout={30} />
  <Panel defaultLayout={70} />
</PanelGroup>
```

**After (v4.x)**:
```typescript
// Use defaultSize instead of defaultLayout
<PanelGroup>
  <Panel defaultSize={30} />
  <Panel defaultSize={70} />
</PanelGroup>
```

**What to Do**:
1. Find all `defaultLayout` usages
2. Rename to `defaultSize`
3. Ensure values still sum to 100 (percentage-based)

**Command to find usages**:
```bash
grep -r "defaultLayout" src/
```

#### Additional Changes in v4

- **Collapse behavior**: More consistent collapse animations
- **Keyboard navigation**: Improved arrow key handling
- **Panel groups**: Better nested panel group support

**Testing Focus**:
- Test panel resizing with mouse drag
- Test keyboard navigation (arrow keys)
- Test collapse/expand transitions
- Verify panel size persistence if using localStorage

---

### recharts v3 Migration

#### Breaking Change 1: TypeScript Type Imports

**Before (v2.x)**:
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TooltipProps } from 'recharts';
```

**After (v3.x)**:
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
// Type imports may have changed paths
import type { TooltipProps } from 'recharts';
```

**What to Do**:
1. Review all recharts imports
2. Add `type` keyword for type-only imports
3. Check for TypeScript errors after upgrade
4. Update any custom types that extend recharts types

**Command to find usages**:
```bash
grep -r "from 'recharts'" src/
```

#### Breaking Change 2: Animation API

**Before (v2.x)**:
```typescript
<LineChart>
  <Line 
    dataKey="value" 
    isAnimationActive={true}
    animationDuration={1000}
  />
</LineChart>
```

**After (v3.x)**:
```typescript
<LineChart>
  <Line 
    dataKey="value" 
    animationDuration={1000}
    // isAnimationActive is now just 'animation'
    animation={true}
  />
</LineChart>
```

**What to Do**:
1. Find all `isAnimationActive` props
2. Rename to `animation`
3. Test that animations still work as expected

**Command to find usages**:
```bash
grep -r "isAnimationActive" src/
```

#### Additional Changes in v3

- **Responsive props**: New responsive behavior for charts
- **Tooltip API**: Enhanced tooltip customization
- **Accessibility**: Better ARIA labels and keyboard navigation
- **D3 updates**: Uses latest D3 for better performance

**Testing Focus**:
- Test all chart types (Line, Bar, Area, Pie, etc.)
- Verify tooltips display correctly
- Check responsive behavior on different screen sizes
- Test animations and transitions
- Verify data formatting and axis labels

---

## Testing Recommendations

### After Updating Dependencies

#### 1. Run Type Checking
```bash
npm run build
# or
tsc --noEmit
```
**What to Look For**:
- Type errors in component props
- Import path issues
- API usage errors

#### 2. Run Linting
```bash
npm run lint
```
**What to Look For**:
- Deprecated API warnings
- Code style issues
- Unused imports

#### 3. Manual Testing Checklist

##### For react-resizable-panels Changes:
- [ ] Open any page with resizable panels
- [ ] Drag panel dividers to resize
- [ ] Test collapse/expand buttons
- [ ] Use keyboard navigation (arrow keys)
- [ ] Check panel size persistence across page reloads
- [ ] Test on mobile/tablet (touch interactions)
- [ ] Verify no console errors or warnings

##### For recharts Changes:
- [ ] Open any page with charts/graphs
- [ ] Verify data displays correctly
- [ ] Test tooltips on hover
- [ ] Check animations on data updates
- [ ] Test responsive behavior (resize window)
- [ ] Verify legends and axis labels
- [ ] Test on mobile/tablet
- [ ] Verify no console errors or warnings

#### 4. Cross-Browser Testing

Test in at least:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on macOS)

#### 5. Performance Testing

Before and after update:
```bash
# Build production bundle
npm run build

# Check bundle size
du -sh dist/

# Use browser DevTools Performance tab to:
# - Record interaction with resizable panels
# - Record interaction with charts
# - Compare before/after metrics
```

**What to Look For**:
- Significant bundle size changes
- Performance regressions in animations
- Memory leaks in chart updates

---

## Rollback Plan

If you encounter critical issues after updating:

### Quick Rollback
```bash
# Revert to previous versions
npm install react-resizable-panels@2.1.9
npm install recharts@2.15.4
npm install
```

### Verify Rollback
```bash
# Check package.json has old versions
cat package.json | grep -E "(react-resizable-panels|recharts)"

# Rebuild
npm run build

# Test
npm run dev
```

---

## Additional Resources

### react-resizable-panels
- **GitHub**: https://github.com/bvaughn/react-resizable-panels
- **Changelog**: https://github.com/bvaughn/react-resizable-panels/releases
- **Documentation**: https://github.com/bvaughn/react-resizable-panels#documentation

### recharts
- **GitHub**: https://github.com/recharts/recharts
- **Changelog**: https://github.com/recharts/recharts/releases
- **Documentation**: https://recharts.org/
- **Migration Guide**: https://recharts.org/en-US/guide/migrate

### General React 19 Resources
- **React 19 Blog**: https://react.dev/blog/2024/12/05/react-19
- **React 19 Upgrade Guide**: https://react.dev/blog/2024/04/25/react-19-upgrade-guide

---

## Questions or Issues?

If you encounter problems after updating:

1. **Check console errors** - Look for specific error messages
2. **Review this migration guide** - Ensure all breaking changes are addressed
3. **Check GitHub Issues** - Search for similar problems in dependency repos
4. **Rollback if critical** - Use the rollback plan above if blocking production
5. **Document the issue** - Add notes to this file for future reference

---

**Last Updated**: December 30, 2025
