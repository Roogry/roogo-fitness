# State Management

Roogo Fitness relies heavily on **Angular Signals** for state management, moving away from complex RxJS chains where possible.

## Principles

1. **Services as State Holders**: We use singleton services (in the `core/` folder) to hold global state that multiple features need to access.
2. **Signals for Reactivity**: Services expose their state as Signals (often as `Signal<T>` or `computed()`) so that components can react to changes automatically.
3. **Promises for Async Operations**: Since we use IndexedDB (`idb`), database interactions are inherently Promise-based. We fetch data using Promises and update Signals with the result.

## Example: Managing Workout State

Here is an example of how a service manages state using Signals:

```typescript
import { Injectable, signal, computed, inject } from '@angular/core';
import { DbService } from './db.service';
import { WorkoutPlan } from '@/shared/models';

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  private db = inject(DbService);

  // Private writable signal for internal state
  private _activePlan = signal<WorkoutPlan | null>(null);

  // Public read-only signal for components to consume
  public activePlan = this._activePlan.asReadonly();

  // Computed state based on the active plan
  public isPlanActive = computed(() => this._activePlan() !== null);

  /**
   * Fetches the active plan from the database and updates the signal.
   */
  async loadActivePlan(): Promise<void> {
    try {
      // Async operation using Promise
      const plan = await this.db.getActivePlan(); 
      
      // Update signal state
      this._activePlan.set(plan);
    } catch (error) {
      console.error('Failed to load active plan', error);
      this._activePlan.set(null);
    }
  }
}
```

## When to Use RxJS?

While Signals handle synchronous state and UI reactivity perfectly, RxJS is still preferred for:
- Handling DOM events over time (e.g., debouncing a search input).
- Handling WebSockets or server-sent events.
- Complex race conditions or retries in HTTP requests (if a REST API is introduced later).

If a component needs to bridge RxJS to Signals, use the `toSignal()` utility function provided by `@angular/core/rxjs-interop`.
