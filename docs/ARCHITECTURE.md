# Data-Driven Slide Architecture

## Overview
The presentation has been refactored to use a robust data-driven architecture that separates content from presentation logic. This makes it easy to add, modify, or reorder slides without touching component code.

## Key Components

### 1. Type Definition (`src/types/slides.ts`)
```typescript
export interface SlideData {
  id: string;           // Unique identifier
  title: string;        // Main slide title
  subtitle?: string;    // Optional subtitle/tagline
  content?: ReactNode;  // Custom React content
  code?: string;        // Code snippet to display
  bullets?: string[];   // Bullet points list
}
```

### 2. Slide Data (`src/data/slides.ts`)
- Centralized data source for all slides
- Contains 10 comprehensive slides covering:
  - Cover slide with platform overview
  - Table of contents
  - DeepSeek Platform details with Python code
  - OpenRouter Platform with TypeScript config
  - Model Endpoints with API examples
  - Python Integration with LiteLLM
  - Best Practices for production systems
  - Resources & repository links
  - Summary with key takeaways

### 3. Universal Slide Component (`src/components/UniversalSlide.tsx`)
- Single component that renders any slide based on data
- Special handling for specific slide types:
  - **Cover**: Hero layout with icons and CTAs
  - **Table of Contents**: Grid layout with numbered sections
  - **Summary**: Conclusion layout with checkmarks
  - **Default**: Standard layout with bullets and code
- Automatically detects code language (Python vs TypeScript)
- Responsive and accessible design

### 4. Enhanced Code Block (`src/components/CodeBlock.tsx`)
- Syntax highlighting for both Python and TypeScript
- Copy-to-clipboard functionality
- Language-specific keyword detection
- Visual feedback on copy action

## Adding New Slides

To add a new slide, simply add an object to the `slides` array in `src/data/slides.ts`:

```typescript
{
  id: "my-new-slide",
  title: "My New Topic",
  subtitle: "Detailed explanation",
  bullets: [
    "First key point",
    "Second key point"
  ],
  code: `// Optional code example
const example = "Hello World";`
}
```

The UniversalSlide component will automatically render it with the appropriate layout.

## Benefits

1. **Maintainability**: Content changes don't require component modifications
2. **Scalability**: Easy to add/remove slides without code changes
3. **Consistency**: All slides follow the same design patterns
4. **Type Safety**: TypeScript ensures data integrity
5. **Reusability**: SlideData interface can be extended for new features

## Technical Specifications Included

The presentation now contains detailed technical content covering:
- Platform architectures (DeepSeek, OpenRouter)
- API endpoints and configurations
- Integration patterns with Python (LiteLLM)
- Security best practices
- Performance optimization strategies
- Links to core infrastructure repositories

All content is structured, searchable, and easy to navigate through the interactive slide deck interface.
