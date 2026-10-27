import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Muscle } from '@/shared/models';
import { DbService } from './db.service';
import { MuscleService } from './muscle.service';

const SIMULATED_DELAY_MS = 100;

describe('MuscleService.getMuscles', () => {
  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  it('returns the stored muscles in display order', async () => {
    vi.useFakeTimers();
    const stored: Muscle[] = [
      { id: 16, name: 'Forearms', display_order: 11 },
      { id: 15, name: 'Core', display_order: 14 },
      { id: 8, name: 'Biceps', display_order: 9 },
      { id: 99, name: 'Custom' },
    ];

    TestBed.configureTestingModule({
      providers: [
        MuscleService,
        { provide: DbService, useValue: { getMuscles: vi.fn().mockResolvedValue(stored) } },
      ],
    });

    const pending = TestBed.inject(MuscleService).getMuscles();
    await vi.advanceTimersByTimeAsync(SIMULATED_DELAY_MS);
    const muscles = await pending;

    expect(muscles.map((muscle) => muscle.name)).toEqual(['Biceps', 'Forearms', 'Core', 'Custom']);
    expect(stored.map((muscle) => muscle.name)).toEqual(['Forearms', 'Core', 'Biceps', 'Custom']);
  });
});
