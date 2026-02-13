# Rust Platform Reference

## Detection

**Files:** `Cargo.toml`, `Cargo.lock`, `src/main.rs`, `src/lib.rs`

## Common Patterns

### Web Frameworks
- Actix-web
- Rocket
- Axum
- Warp

**Indicators:**
- `actix_web::web`, `rocket::get`
- Route handlers with macros
- Request/Response types

### Async Runtime
- Tokio
- async-std

**Indicators:**
- `#[tokio::main]`, `#[async_std::main]`
- `async fn` definitions
- `.await` usage

### Error Handling
- Result<T, E>
- Custom error types
- thiserror, anyhow

**Indicators:**
- `Result<T, Error>` return types
- `?` operator
- `thiserror::Error` derive macro
- `anyhow::Result`

### Database
- SQLx
- Diesel
- SeaORM

**Indicators:**
- `sqlx::query!`, `diesel::*`
- Database connection pools
- Query builders

## Source Locations

**Cargo workspace structure:**
```
project/
├── src/
│   ├── main.rs             # Binary entry point
│   ├── lib.rs              # Library root
│   ├── api/                # API routes
│   ├── service/            # Business logic
│   ├── model/              # Data models
│   └── db/                 # Database layer
├── tests/                  # Integration tests
└── Cargo.toml
```

## Architectural Patterns

### Ownership & Borrowing
- Ownership transfer
- Borrowing (& and &mut)
- Lifetimes

### Code Conventions
- snake_case for functions/variables
- PascalCase for types/traits
- SCREAMING_SNAKE_CASE for constants
- Module organization in directories

### Rust-Specific Patterns
- Builder pattern
- Type state pattern
- Trait objects
- Smart pointers (Box, Rc, Arc)

## Skill Discovery Hints

Look for:
- Route handlers with framework macros
- Service structs with methods
- Repository/database access patterns
- Custom error types
- Async/await patterns
- Trait implementations
- Middleware/guards
- Testing with `#[cfg(test)]`
