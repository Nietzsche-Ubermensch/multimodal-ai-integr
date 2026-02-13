# Node.js Platform Reference

## Detection

**Files:** `package.json` without framework-specific indicators

## Common Patterns

### Backend Frameworks
- Express.js
- Fastify
- Koa
- NestJS
- Hapi

**Indicators:**
- `express`, `fastify`, `koa` dependencies
- `@nestjs/*` imports
- Route handlers
- Middleware functions

### API Patterns
- REST API
- GraphQL
- gRPC
- WebSocket servers

**Indicators:**
- Route definitions
- GraphQL schemas
- `apollo-server`, `graphql` dependencies
- Controller classes

### Database Integration
- Prisma
- TypeORM
- Sequelize
- Mongoose
- Knex

**Indicators:**
- `prisma/schema.prisma`
- Entity/Model files
- Repository pattern
- Database service classes

### Authentication
- Passport.js
- JWT strategies
- OAuth providers
- Session management

**Indicators:**
- `passport`, `jsonwebtoken` dependencies
- Auth middleware
- Strategy files

## Source Locations

**Express/API structure:**
```
src/
├── routes/         # API routes
├── controllers/    # Request handlers
├── services/       # Business logic
├── models/         # Data models
├── middleware/     # Express middleware
├── config/         # Configuration
└── utils/          # Utilities
```

**NestJS structure:**
```
src/
├── modules/        # Feature modules
├── controllers/    # Controllers
├── services/       # Services
├── entities/       # Database entities
├── dto/            # Data transfer objects
└── guards/         # Auth guards
```

## Architectural Patterns

### Layered Architecture
- Routes → Controllers → Services → Repositories
- Dependency injection
- Service layer pattern

### Code Conventions
- camelCase for functions/variables
- PascalCase for classes
- Interface names prefixed with `I` (optional)
- Async/await for asynchronous code

### TypeScript Patterns
- Interface-based dependency injection
- Generic repository patterns
- Type-safe request/response
- DTO validation with class-validator

## Skill Discovery Hints

Look for:
- Route handlers and middleware
- Service classes
- Database models/entities
- API utilities
- Authentication strategies
- Error handling patterns
- Validation schemas
- Configuration management
- Logger implementations
- API documentation (Swagger)
