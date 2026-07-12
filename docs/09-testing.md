# Testing

We use **Vitest** as our primary testing framework due to its speed and compatibility with modern ESM setups, replacing traditional Karma/Jasmine.

## 1. Unit Testing Services

Services containing business logic should have thorough unit tests. Since many of our services interact with `DbService` (which uses IndexedDB), you will need to mock `DbService`.

```typescript
import { TestBed } from '@angular/core/testing';
import { WorkoutService } from './workout.service';
import { DbService } from './db.service';
import { vi } from 'vitest';

describe('WorkoutService', () => {
  let service: WorkoutService;
  let mockDbService: any;

  beforeEach(() => {
    mockDbService = {
      getActivePlan: vi.fn().mockResolvedValue({ id: '1', name: 'Test Plan' })
    };

    TestBed.configureTestingModule({
      providers: [
        WorkoutService,
        { provide: DbService, useValue: mockDbService }
      ]
    });
    service = TestBed.inject(WorkoutService);
  });

  it('should load active plan', async () => {
    await service.loadActivePlan();
    expect(service.activePlan()?.name).toBe('Test Plan');
  });
});
```

## 2. Component Testing

For component testing, especially those with complex interactions, prefer using **Component Harnesses** (from `@angular/cdk/testing`) to abstract away DOM querying.

If you just need basic rendering tests, standard `TestBed` setups are sufficient.

## 3. Running Tests

Run the test suite using:

```bash
pnpm test
```
