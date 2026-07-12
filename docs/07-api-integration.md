# API Integration & Data Storage

Roogo Fitness currently relies on an **Offline-First** model utilizing the browser's IndexedDB. We do not currently have a REST API backend, but this document outlines how we interact with the local database and the patterns we will use if an external API is introduced.

## IndexedDB Interaction

All direct database interactions are encapsulated within the `DbService` (`src/app/core/services/db.service.ts`). 

- We use the `idb` library (a lightweight promise wrapper for IndexedDB) to manage the database.
- `DbService` handles:
  - Database initialization and versioning.
  - Initial data seeding (mock exercises, muscles).
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
