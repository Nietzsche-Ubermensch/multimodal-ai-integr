# Go Platform Reference

## Detection

**Files:** `go.mod`, `go.sum`, `main.go`

## Common Patterns

### Web Frameworks
- Gin
- Echo
- Fiber
- Chi
- gorilla/mux

**Indicators:**
- `gin.Context`, `echo.Context`
- Router setup with handler functions
- Middleware chains

### API Patterns
- REST API with standard library
- gRPC services
- GraphQL with gqlgen

**Indicators:**
- `http.HandleFunc`, `http.Handler`
- `.proto` files
- gRPC server setup
- GraphQL schema files

### Database Access
- GORM
- sqlx
- pgx (PostgreSQL)
- MongoDB driver

**Indicators:**
- `gorm.DB`, `sqlx.DB`
- Model structs with `gorm` tags
- SQL query builders
- Database connection pools

### Concurrency Patterns
- Goroutines
- Channels
- Context
- WaitGroups
- Sync primitives

**Indicators:**
- `go func()` statements
- Channel operations `<-`, `chan`
- `context.Context` usage
- `sync.WaitGroup`, `sync.Mutex`

## Source Locations

**Standard Go structure:**
```
project/
├── cmd/
│   └── server/             # Application entry points
│       └── main.go
├── internal/
│   ├── api/                # API handlers
│   ├── service/            # Business logic
│   ├── repository/         # Data access
│   └── model/              # Data models
├── pkg/                    # Public libraries
├── config/                 # Configuration
└── go.mod
```

## Architectural Patterns

### Layered Architecture
- Handlers → Services → Repositories
- Dependency injection via constructors
- Interface-based abstractions

### Code Conventions
- PascalCase for exported names
- camelCase for unexported names
- Package names lowercase, single word
- Interface names with `-er` suffix
- Error handling with explicit returns

### Go-Specific Patterns
- Error wrapping with `fmt.Errorf`
- Defer for cleanup
- Table-driven tests
- Context for cancellation

## Skill Discovery Hints

Look for:
- HTTP handlers in `api/`, `handler/`, `controller/`
- Business logic in `service/`, `domain/`
- Data access in `repository/`, `store/`
- Models in `model/`, `entity/`
- Middleware functions
- Context usage patterns
- Error handling patterns
- Testing patterns in `_test.go` files
