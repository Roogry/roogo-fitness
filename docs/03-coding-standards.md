# Coding Standards

To maintain consistency and readability across the codebase, all contributors and AI agents must adhere to the following coding standards.

## 1. Naming Conventions

### Files and Directories
- **Format**: `kebab-case`
- **Rule**: All file names and folder names must be lowercase and use dashes to separate words.
- **Examples**: `workout-service.ts`, `home-logged-workout-card.ts`, `features/session-active/`.
- **Suffixes**: Generally, component files don't require the verbose `.component.ts` suffix in this project's convention (often just `.ts`, `.html`, `.css`), but you must adhere to the surrounding file conventions in the directory you are working in.

### Classes and Interfaces
- **Format**: `PascalCase`
- **Rule**: Component classes, Service classes, and Interfaces must be PascalCase.
- **Examples**: `class HomeLoggedWorkoutCardComponent`, `interface LoggedSession`, `class DbService`.
- **Prefixing**: Do **not** prefix interfaces with `I` (e.g., use `WorkoutPlan`, not `IWorkoutPlan`).

### Variables, Properties, and Functions
- **Format**: `camelCase`
- **Rule**: Standard variable names, component properties, and function names.
- **Examples**: `recentSessions`, `calculateTotalVolume()`, `activePlan`.

### Event Handlers and Component Outputs
- **Event Handler Functions**:
  - **Format**: `on + [Element] + [Event]`
  - **Rule**: Functions called in templates to handle events should be prefixed with `on`, followed by the target element/subject name and the event name.
  - **Examples**: `onSaveButtonClick()`, `onSearchInputChange()`, `onUserCardClick()`.

- **Component Output Signals / Event Emitters**:
  - **Format**: `[Element] + [Event]`
  - **Rule**: Component outputs (`output()`) should use the target element/subject name and event name, **without** the `on` prefix.
  - **Examples**: `saveButtonClick = output<void>()`, `searchInputChange = output<string>()`, `deleteUserClick = output<string>()`.

### Constants
- **Format**: `UPPER_SNAKE_CASE`
- **Rule**: Global constant values that do not change.
- **Examples**: `MAX_REPS_ALLOWED`, `DEFAULT_REST_TIMER`.

## 2. Formatting and Linting

- **Prettier**: The project uses Prettier for automated code formatting. Ensure your IDE is configured to format on save using the provided `.prettierrc`.
- **Indentation**: 2 spaces.
- **Quotes**: Single quotes (`'`) for TypeScript and JavaScript strings. Double quotes (`"`) for HTML attributes.

## 3. Documentation and Comments

### JSDoc for Services and Shared Utilities
All services, shared utility functions, and complex models should have JSDoc comments describing their purpose, parameters, and return types.

```typescript
/**
 * Calculates the estimated 1 Rep Max (1RM) based on weight and reps.
 * @param weight The weight lifted (in kg or lbs).
 * @param reps The number of repetitions completed.
 * @returns The estimated 1RM value.
 */
export function calculateOneRepMax(weight: number, reps: number): number { ... }
```

### Inline Comments
- Use inline comments (`//`) to explain *why* a specific piece of complex logic exists, not *what* it is doing (the code should be self-explanatory).
- Avoid leaving commented-out code in the main branch.

## 4. Angular Specifics

- **Inject Function**: Prefer using the `inject()` function for Dependency Injection over constructor injection.
  ```typescript
  // Prefer
  router = inject(Router);
  
  // Avoid
  constructor(private router: Router) {}
  ```
- **Lifecycle Hooks**: Always implement the corresponding interface for lifecycle hooks (e.g., `implements OnInit`).
