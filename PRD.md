# Planning Guide

A comprehensive technical presentation platform for exploring multimodal AI integration architectures, API configurations, and implementation patterns across Deepseek, OpenRouter, xAI, NVIDIA, and other leading AI platforms. Built with a robust data-driven architecture separating content from presentation logic.

**Experience Qualities**: 
1. **Technical & Authoritative**: Documentation-grade accuracy with detailed technical specifications, code examples, and architecture diagrams
2. **Interactive & Explorable**: Dynamic navigation allowing developers to dive deep into specific integration patterns and API configurations
3. **Visually Sophisticated**: Code-focused design aesthetic with syntax highlighting, technical diagrams, and professional presentation styling

**Complexity Level**: Complex Application (advanced functionality with multiple views)

This is a comprehensive technical reference platform with a data-driven architecture enabling rapid content updates. Features include multiple interconnected slides, code execution examples, API specifications, and interactive documentation for developer audiences.

## Essential Features

### Slide Navigation System
- **Functionality**: Full-screen slide-based presentation with keyboard and click navigation, powered by centralized slide data
- **Purpose**: Allow developers to move through technical content sequentially or jump to specific sections
- **Trigger**: Arrow keys, click navigation, or section menu
- **Progression**: Load app → Display cover slide → Navigate via keyboard/clicks → Jump to sections via menu → View code examples
- **Success criteria**: Smooth transitions between slides, preserved scroll position, responsive navigation

### Data-Driven Architecture
- **Functionality**: Centralized SlideData interface with content stored separately from presentation logic
- **Purpose**: Enable rapid content updates without modifying React components
- **Trigger**: Adding new slide objects to data array
- **Progression**: Define slide data → Universal component renders → Automatic layout selection → Syntax highlighting applied
- **Success criteria**: New slides render correctly, type safety enforced, consistent styling maintained

### Platform Architecture Overview
- **Functionality**: Detailed breakdown of Deepseek, OpenRouter, xAI platforms with technical specifications
- **Purpose**: Understand core capabilities, MoE architecture, multimodal processing, and platform differences
- **Trigger**: Navigate to architecture section slides
- **Progression**: Select platform → View architecture diagram → Explore technical specs → Review performance metrics
- **Success criteria**: Clear visual presentation of system architecture, readable metrics, comprehensive technical details

### Model Endpoints Catalog
- **Functionality**: Comprehensive database of 13+ AI models with endpoints, specifications, and use cases
- **Purpose**: Reference guide for model selection and API integration
- **Trigger**: Navigate to model endpoints section
- **Progression**: Browse model list → View specifications → Copy endpoint URLs → Review capabilities
- **Success criteria**: Complete model information, searchable/filterable, copy-to-clipboard functionality

### Code Examples Library
- **Functionality**: Syntax-highlighted code snippets for Python, TypeScript, cURL with copy functionality
- **Purpose**: Provide production-ready integration code for immediate use
- **Trigger**: Navigate to implementation examples
- **Progression**: Select use case → View code → Copy snippet → Customize for project
- **Success criteria**: Accurate syntax highlighting, working code examples, multi-language support

### API Specifications Reference
- **Functionality**: Detailed parameter definitions, response schemas, and authentication methods with interactive testing
- **Purpose**: Technical reference for API implementation with live request/response examples
- **Trigger**: Navigate to API specs section or interactive testing slides
- **Progression**: Select endpoint → View parameters → Review response format → Test with live examples → Copy cURL commands
- **Success criteria**: Complete parameter documentation, type definitions, example payloads, interactive request editor

### Interactive API Testing
- **Functionality**: Live API request/response testing with multiple provider examples and real-time formatting
- **Purpose**: Allow developers to experiment with API payloads and see expected responses
- **Trigger**: Navigate to Live API Testing or API Reference slides
- **Progression**: Select provider → Edit request JSON → Send request → View formatted response → Copy examples
- **Success criteria**: Editable request fields, simulated responses, accurate latency simulation, copy functionality

## Edge Case Handling

- **Keyboard Navigation Conflicts**: Prevent default browser shortcuts during presentation mode
- **Code Copy Failures**: Fallback to manual selection if clipboard API unavailable
- **Long Code Blocks**: Implement horizontal scroll with visible indicators for overflow content
- **Mobile Viewing**: Responsive layout with touch swipe navigation for tablets
- **Missing Content**: Graceful loading states and error messages for unavailable resources

## Design Direction

The design should evoke the feeling of a **high-fidelity developer conference presentation** with a sophisticated, code-centric aesthetic. Think technical documentation meets interactive playground—professional, precise, and built for engineers who appreciate attention to detail. The interface should feel like premium developer tooling with dark themes, monospace typography, and technical precision.

## Color Selection

**Primary Color**: Deep Technical Blue `oklch(0.55 0.15 240)` - Represents trust, technical precision, and cutting-edge AI technology
**Secondary Colors**: 
  - Code Background: Rich Dark `oklch(0.15 0.01 240)` for code blocks and slide backgrounds
  - Accent Cyan: `oklch(0.75 0.12 200)` for interactive elements, links, and highlights
  - Success Green: `oklch(0.70 0.15 145)` for code syntax and positive indicators
**Accent Color**: Electric Purple `oklch(0.65 0.20 290)` for CTAs, active states, and model badges
**Foreground/Background Pairings**:
  - Primary Background `oklch(0.12 0.02 240)`: Light text `oklch(0.95 0.01 240)` - Ratio 18.2:1 ✓
  - Code Background `oklch(0.15 0.01 240)`: Syntax colors `oklch(0.75 0.12 200)` - Ratio 12.5:1 ✓
  - Accent (Electric Purple `oklch(0.65 0.20 290)`): White text `oklch(1 0 0)` - Ratio 5.8:1 ✓

## Font Selection

Typography must convey technical precision and code-readability while maintaining professional presentation quality.

- **Typographic Hierarchy**:
  - H1 (Slide Titles): JetBrains Mono Bold / 56px / tight letter spacing (-0.02em)
  - H2 (Section Headers): Inter SemiBold / 32px / normal spacing
  - H3 (Subsections): Inter Medium / 24px / normal spacing
  - Body Text: Inter Regular / 16px / 1.6 line height
  - Code Blocks: JetBrains Mono Regular / 14px / 1.5 line height
  - Inline Code: JetBrains Mono Medium / 15px / background highlight

**Primary Font**: JetBrains Mono for code, headings, and technical content—engineered for developers with excellent character distinction
**Secondary Font**: Inter for body text and UI elements—clean, modern, highly readable at all sizes

## Animations

Animations should enhance the technical presentation experience with subtle, purposeful motion that aids comprehension without distraction.

- **Slide Transitions**: Smooth horizontal slide with 400ms cubic-bezier easing for professional presentation feel
- **Code Block Reveal**: Subtle fade-in with syntax highlighting cascade (50ms stagger per line)
- **Navigation Highlights**: Quick pulse effect (200ms) when section becomes active
- **Copy Feedback**: Success toast with slide-up animation confirming code copied
- **Hover States**: Gentle color shift (150ms) on interactive elements for tactile feedback

## Component Selection

- **Components**: 
  - `Card` for slide containers with custom dark styling and border accents
  - `Button` for navigation controls with icon support (phosphor-icons)
  - `Tabs` for switching between code examples and cURL/response views
  - `Badge` for model types, API versions, and feature tags
  - `Dialog` for expanded code views and detailed specifications
  - `Separator` for section divisions within slides
  - `ScrollArea` for long code blocks and content overflow
  - `Textarea` for editable API request payloads in interactive testing
  - `Select` for choosing between API provider examples

- **Customizations**: 
  - Custom syntax highlighter component for code blocks (not using external libraries)
  - Full-screen slide container with fixed aspect ratio for presentation mode
  - Progress indicator showing current slide position
  - Custom keyboard shortcut handler for presentation navigation
  - Interactive API testing component with live request/response simulation
  - Copy-to-clipboard functionality with visual feedback throughout

- **States**: 
  - Buttons: Default (semi-transparent), Hover (accent glow), Active (pressed state), Disabled (low opacity)
  - Code Blocks: Default (dark bg), Hover (border highlight), Copied (success flash)
  - Slides: Active (visible), Previous/Next (pre-loaded), Inactive (unmounted)
  - Interactive Elements: Editing (focused textarea), Loading (processing request), Success (response received)

- **Icon Selection**: 
  - `ArrowLeft/ArrowRight` for slide navigation
  - `Copy/Check` for code copy states
  - `Code/Terminal` for code section indicators
  - `GitBranch` for repository references
  - `Rocket` for deployment examples
  - `Brain/Cpu` for AI model indicators
  - `Play/Lightning` for interactive API testing triggers
  - `List` for slide menu navigation

- **Spacing**: Consistent 8px base unit - cards (24px padding), sections (32px gap), slides (40px margins)

- **Mobile**: 
  - Stack slide content vertically on <768px
  - Touch swipe gestures for slide navigation
  - Reduced font sizes (H1: 36px, Body: 14px)
  - Collapsible code blocks with expand button
  - Bottom-fixed navigation bar for mobile controls
