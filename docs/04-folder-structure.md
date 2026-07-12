# Folder Structure

This document outlines the standard folder structure used in the Roogo Fitness Angular application.

```text
src/
└── app/
    ├── core/                # Singleton services, global state, interceptors
    │   ├── services/        # E.g., db.service.ts, workout.service.ts
    │   ├── guards/          # Route guards
    │   └── interceptors/    # HTTP interceptors (if applicable later)
    │
    ├── shared/              # Reusable UI components, pipes, directives, models
    │   ├── components/      # E.g., card/, button/, typography/
    │   ├── models/          # Shared interfaces and types (e.g., LoggedSession)
    │   ├── pipes/           # Custom pipes
    │   └── directives/      # Custom directives
    │
    ├── features/            # Feature-specific modules (lazy loaded)
    │   ├── home/            # Home dashboard feature
    │   ├── plan/            # Workout plan management
    │   ├── exercise/        # Exercise library
    │   └── session-active/  # The active workout session view
    │
    ├── app.component.ts     # Root component
    ├── app.routes.ts        # Root routing configuration
    └── app.config.ts        # Application bootstrap configuration
```

## 1. Core Module (`core/`)
- Contains code that is instantiated once per application (Singletons).
- Do not import `core` elements into `shared`.
- Contains the `DbService` and global data fetching services.

## 2. Shared Module (`shared/`)
- Contains "dumb" or presentational components. These components should not inject `core` services directly if they are meant to be highly reusable. 
- Passed data via `@Input()` (or `input()` signals) and emit events via `@Output()` (or `output()` signals).
- Example: `ZardCardComponent`, `CircleMuscleCardComponent`.

## 3. Features Module (`features/`)
- Contains smart components and logic specific to a feature area.
- Each feature directory (e.g., `home/`) can contain its own specific `components/`, `services/`, and routing logic if it becomes complex enough.
