# Generic Platform Reference

## Detection

**Used when:** No specific platform detection files found

## Common Patterns

### Code Organization
- MVC (Model-View-Controller)
- Service-oriented architecture
- Layered architecture
- Modular design

**Indicators:**
- Directory structure (models, views, controllers, services)
- Import/export patterns
- Class hierarchies
- Interface definitions

### Design Patterns
- Singleton
- Factory
- Repository
- Strategy
- Observer
- Decorator

**Indicators:**
- Class naming conventions
- Interface implementations
- Dependency patterns

### Testing Patterns
- Unit tests
- Integration tests
- E2E tests
- Test utilities

**Indicators:**
- Test file naming (`.test.`, `.spec.`)
- Test directories (`__tests__`, `tests`, `test`)
- Mock/stub patterns

## Source Locations

**Common structures:**
```
src/
├── core/           # Core functionality
├── modules/        # Feature modules
├── shared/         # Shared utilities
├── types/          # Type definitions
└── config/         # Configuration
```

## Skill Discovery Hints

Look for:
- Repeated file naming patterns
- Common import patterns
- Class/interface hierarchies
- Utility functions
- Configuration patterns
- Error handling conventions
- Logging patterns
- Documentation standards
