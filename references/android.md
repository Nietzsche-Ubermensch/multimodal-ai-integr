# Android/Gradle Platform Reference

## Detection

**Files:** `build.gradle`, `build.gradle.kts`, `settings.gradle`, `settings.gradle.kts`, `AndroidManifest.xml`

## Common Patterns

### Architecture Components
- ViewModel
- LiveData
- Room Database
- Navigation
- DataBinding/ViewBinding
- Paging

**Indicators:**
- `androidx.lifecycle.ViewModel` imports
- `@Dao`, `@Entity`, `@Database` annotations
- `LiveData<>`, `MutableLiveData<>` usage
- Navigation graph XML files

### Dependency Injection
- Hilt
- Dagger
- Koin

**Indicators:**
- `@HiltViewModel`, `@AndroidEntryPoint`
- `@Module`, `@Provides`, `@Inject`
- Hilt/Dagger/Koin setup in Application class

### UI Patterns
- Jetpack Compose
- XML Layouts
- RecyclerView Adapters
- Fragments
- Activities

**Indicators:**
- `@Composable` annotations
- `setContent { }` in activities
- Layout XML files
- Fragment classes
- RecyclerView.Adapter implementations

## Source Locations

**Typical Android structure:**
```
app/src/main/
├── java/com/company/app/
│   ├── ui/
│   │   ├── screens/        # Compose screens or Fragments
│   │   ├── components/     # Reusable UI components
│   │   └── adapters/       # RecyclerView adapters
│   ├── data/
│   │   ├── repository/     # Repository pattern
│   │   ├── local/          # Room database
│   │   └── remote/         # API services
│   ├── domain/
│   │   ├── model/          # Domain models
│   │   └── usecase/        # Use cases
│   └── di/                 # Dependency injection modules
└── res/
    ├── layout/             # XML layouts
    ├── navigation/         # Navigation graphs
    └── values/             # Resources
```

## Architectural Patterns

### MVVM (Model-View-ViewModel)
- ViewModels for UI logic
- Repositories for data access
- Use cases for business logic

### Clean Architecture
- Domain layer (entities, use cases)
- Data layer (repositories, data sources)
- Presentation layer (UI, ViewModels)

### Code Conventions
- PascalCase for classes
- camelCase for functions/properties
- Package organization by feature or layer
- Kotlin coroutines for async operations

## Skill Discovery Hints

Look for:
- ViewModels in `ui/viewmodel/` or feature packages
- Repositories in `data/repository/`
- Room entities and DAOs in `data/local/`
- Retrofit services in `data/remote/`
- Hilt modules in `di/` package
- Compose screens with `@Composable`
- Navigation setup
- RecyclerView adapters
