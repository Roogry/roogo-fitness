import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ExerciseService } from '@/core/services/exercise.service';
import { WorkoutService } from '@/core/services/workout.service';
import { ZardDialogService } from '@/shared/components/zard/dialog';
import { Exercise, LoggedExercise } from '@/shared/models';
import { SessionActive, lastExerciseIdWithCompletedSet } from './session-active';

function tracked(id: number, completedAt?: string): LoggedExercise {
  const exercise: Exercise = {
    id,
    name: `Exercise ${id}`,
    media: [],
  };

  return {
    id,
    exercise,
    sets: [
      {
        id: id * 10,
        set_number: 1,
        reps_completed: 8,
        weight_lifted: 40,
        completed_at: completedAt,
      },
    ],
  };
}

describe('lastExerciseIdWithCompletedSet', () => {
  it('returns null when nothing is completed', () => {
    expect(lastExerciseIdWithCompletedSet([])).toBeNull();
    expect(lastExerciseIdWithCompletedSet([tracked(1), tracked(2)])).toBeNull();
    expect(lastExerciseIdWithCompletedSet([tracked(1, '')])).toBeNull();
  });

  it('returns the last exercise in list order that has a completed set', () => {
    const exercises = [
      tracked(1, '2026-10-08T00:00:00.000Z'),
      tracked(2),
      tracked(3, '2026-10-08T00:01:00.000Z'),
      tracked(4),
    ];

    expect(lastExerciseIdWithCompletedSet(exercises)).toBe(3);
  });

  it('counts an exercise when any set is completed', () => {
    const exercise = tracked(7);
    exercise.sets.push({
      id: 71,
      set_number: 2,
      completed_at: '2026-10-08T00:02:00.000Z',
    });

    expect(lastExerciseIdWithCompletedSet([tracked(1), exercise, tracked(8)])).toBe(7);
  });
});

describe('SessionActive resume scroll', () => {
  const trackedExercises = signal<LoggedExercise[]>([]);
  const sessionStartTime = signal<number | null>(1_000);
  const scrollIntoView = vi.fn();
  const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;

  beforeEach(async () => {
    trackedExercises.set([]);
    sessionStartTime.set(1_000);
    scrollIntoView.mockClear();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    const workout = {
      trackedExercises,
      sessionStartTime,
      sessionDuration: signal(90),
      totalVolume: signal(0),
      totalSets: signal(0),
      selectedPlanId: signal<number | null>(null),
      selectedSessionId: signal<number | null>(null),
      sessionTitle: signal('Workout Session'),
      refreshTrackedExercises: vi.fn().mockResolvedValue(undefined),
      clearSession: vi.fn(),
      startSessionTimer: vi.fn(),
      setupSessionFromPlan: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [SessionActive],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(convertToParamMap({})) },
        },
        { provide: WorkoutService, useValue: workout },
        { provide: ZardDialogService, useValue: { create: vi.fn() } },
        {
          provide: ExerciseService,
          useValue: { getExercises: vi.fn().mockResolvedValue([]) },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
    TestBed.resetTestingModule();
  });

  async function render(): Promise<ComponentFixture<SessionActive>> {
    const fixture = TestBed.createComponent(SessionActive);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('scrolls once to the last exercise with a completed set', async () => {
    trackedExercises.set([
      tracked(1, '2026-10-08T00:00:00.000Z'),
      tracked(2, '2026-10-08T00:01:00.000Z'),
      tracked(3),
    ]);

    const fixture = await render();
    const target = fixture.nativeElement.querySelector('[data-exercise-id="2"]');

    expect(target).toBeInstanceOf(HTMLElement);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.instances[0]).toBe(target);
    expect(scrollIntoView).toHaveBeenCalledWith({
      block: 'center',
      inline: 'nearest',
      behavior: 'instant',
    });

    trackedExercises.update((exercises) => {
      const next = exercises.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.map((set) => ({ ...set })),
      }));
      next[2].sets[0].completed_at = '2026-10-08T00:03:00.000Z';
      return next;
    });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it('does not scroll when no set is completed', async () => {
    trackedExercises.set([tracked(1), tracked(2)]);

    const fixture = await render();

    expect(scrollIntoView).not.toHaveBeenCalled();

    trackedExercises.update((exercises) => {
      const next = exercises.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.map((set) => ({ ...set })),
      }));
      next[1].sets[0].completed_at = '2026-10-08T00:04:00.000Z';
      return next;
    });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('does not scroll when the session is not running', async () => {
    sessionStartTime.set(null);
    trackedExercises.set([tracked(1, '2026-10-08T00:00:00.000Z')]);

    await render();

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
