# Architecture

The Roogo Fitness application is built using **Angular v21** and follows a modern, **offline-first** architectural pattern.

## Core Technologies

- **Framework**: Angular v21 (using Standalone Components exclusively).
- **Reactivity**: Angular Signals (`signal`, `computed`, `effect`) for fine-grained reactivity.
- **Styling**: Tailwind CSS v4 for utility-first styling, complemented by `class-variance-authority`, `clsx`, and `tailwind-merge` for dynamic UI classes.
- **Data Persistence**: IndexedDB via the `idb` wrapper for fully offline capabilities.
- **Testing**: `vitest` for fast and reliable unit testing.

## Offline-First Approach

Unlike traditional web applications that constantly fetch data from a REST API, Roogo Fitness is designed to work offline. 

1. **Local Storage**: All application data (Exercises, Muscles, Workout Plans, Logged Sessions) is stored directly in the browser's IndexedDB.
2. **`DbService`**: The `DbService` (`src/app/core/services/db.service.ts`) acts as the single source of truth for interacting with the database. It handles initialization, schema upgrades, and basic CRUD operations.
3. **Feature Services**: Services like `WorkoutService` or `ExerciseService` wrap the `DbService` to provide domain-specific logic, returning Promises or wrapping data in Signals to be consumed by components.

## Module Separation

While Angular v21 embraces Standalone Components (meaning `NgModule` is largely absent), we still maintain a logical "module" separation based on directories:

1. **Core (`src/app/core/`)**: Contains singleton services, core configuration, interceptors, and app-wide state that should only be instantiated once.
2. **Shared (`src/app/shared/`)**: Contains highly reusable "dumb" components (e.g., Cards, Buttons), generic models, pipes, and directives that are used across multiple features.
3. **Features (`src/app/features/`)**: Contains the primary feature areas of the application (e.g., `home`, `exercise`, `plan`, `journey`). These are often lazily loaded via the router.

## Routing

The application uses functional router configuration (`provideRouter`). Feature modules define their own routes, which are composed in the main `app.routes.ts`. Lazy loading is utilized for feature areas to ensure a small initial bundle size.
