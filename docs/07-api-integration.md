# API Integration & Data Storage

Roogo Fitness currently relies on an **Offline-First** model utilizing the browser's IndexedDB. We do not currently have a REST API backend, but this document outlines how we interact with the local database and the patterns we will use if an external API is introduced.

## IndexedDB Interaction

All direct database interactions are encapsulated within the `DbService` (`src/app/core/services/db.service.ts`).

- We use the `idb` library (a lightweight promise wrapper for IndexedDB) to manage the database.
- `DbService` handles:
  - Database initialization and versioning.
  - Initial data seeding (exercise library from JSON, default workout plan).
  - Raw CRUD operations (`get`, `put`, `delete`, `getAll`, `count`).

### Example: Fetching Data

Feature-specific services (like `WorkoutService`) inject `DbService` and call its methods.

```typescript
// Inside WorkoutService
async getPlans(): Promise<WorkoutPlan[]> {
  // We wrap the db call to add any domain-specific mapping if needed
  return await this.db.getWorkoutPlans();
}
```

## Exercise seed

The built-in exercise and muscle library lives in `src/assets/data/exercises.json`. `DbService` fetches that file when the app starts. It is not part of the JavaScript bundle. `ngsw-config.json` prefetches `/assets/data/*.json`, so the library is available offline after an update.

`SEED_VERSION` in `src/app/core/utils/seed.constants.ts` must match `seed_version` in the JSON. The value last written is stored in localStorage under `roogo.seedVersion`. To change the library:

1. Edit `src/assets/data/exercises.json`.
2. Set `seed_version` in that file and `SEED_VERSION` to the same new number.
3. Put any new muscle icon in `src/assets/images/muscles/`. A muscle without artwork uses `assets/images/muscles/default_muscle.webp`.

On the next launch, a different `SEED_VERSION` clears and rewrites the `exercises` and `muscles` stores. Custom exercises are removed. Workout plans and logged sessions stay. A plan row that points at a removed exercise is skipped, and the session shows how many were skipped.

The stores are cleared only after the JSON loads and passes validation. If the file fails to load, the existing catalog stays and the app tries again on the next launch.

## Future REST API Integration (Guidelines)

If Roogo Fitness introduces a backend API in the future, follow these patterns:

1. **HttpClient**: Use Angular's `HttpClient` configured via `provideHttpClient()`.
2. **Interceptors**: Use functional interceptors for adding Auth tokens or handling global errors.
3. **RxJS vs Signals**:
   - Use `HttpClient` which returns `Observable<T>`.
   - In your service, use `toSignal()` or the new `resource()` API to convert the async fetch into a Signal that components can effortlessly consume.

```typescript
import { inject, Injectable, Resource } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { resource } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class ApiService {
  http = inject(HttpClient);

  // Using the new resource API (Angular v19+) for async data
  usersResource = resource({
    loader: () => fetch('https://api.example.com/users').then(res => res.json())
  });
}
```
