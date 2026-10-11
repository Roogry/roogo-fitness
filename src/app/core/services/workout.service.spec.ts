import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { ZardDialogService } from '@/shared/components/zard/dialog';
import { LoggedExercise, WorkoutPlan } from '@/shared/models';
import { DbService } from './db.service';
import { WorkoutService } from './workout.service';

const STORAGE_KEY = 'roogo_active_session';

describe('WorkoutService rest timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        WorkoutService,
        { provide: DbService, useValue: {} },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ZardDialogService, useValue: { create: vi.fn() } },
      ],
    });
  });

  afterEach(() => {
    const service = TestBed.inject(WorkoutService);
    service.clearRestTimer();
    service.stopSessionTimer();
    localStorage.clear();
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  function createService(): WorkoutService {
    const service = TestBed.inject(WorkoutService);
    TestBed.flushEffects();
    return service;
  }

  it('starts rest from an end timestamp and formats MM:SS', () => {
    const service = createService();
    const startedAt = Date.now();

    service.startRestTimer(90);

    expect(service.isRestActive()).toBe(true);
    expect(service.restRemainingSeconds()).toBe(90);
    expect(service.restEndsAt()).toBe(startedAt + 90_000);
    expect(service.restTimerFormatted()).toBe('01:30');
  });

  it('does not start rest for a non-positive duration', () => {
    const service = createService();

    service.startRestTimer(0);
    service.startRestTimer(-5);

    expect(service.isRestActive()).toBe(false);
    expect(service.restEndsAt()).toBeNull();
  });

  it('restarts rest when another set is completed', () => {
    const service = createService();

    service.startRestTimer(60);
    vi.advanceTimersByTime(10_000);
    service.startRestTimer(45);

    expect(service.restRemainingSeconds()).toBe(45);
    expect(service.restEndsAt()).toBe(Date.now() + 45_000);
  });

  it('counts down from restEndsAt and clears rest at zero', () => {
    const service = createService();

    service.startRestTimer(3);
    vi.advanceTimersByTime(2_000);
    expect(service.restRemainingSeconds()).toBe(1);
    expect(service.isRestActive()).toBe(true);

    vi.advanceTimersByTime(1_000);
    expect(service.restRemainingSeconds()).toBeNull();
    expect(service.restEndsAt()).toBeNull();
    expect(service.isRestActive()).toBe(false);
  });

  it('adds time only while rest is active', () => {
    const service = createService();

    service.addRestTime(15);
    expect(service.restEndsAt()).toBeNull();

    service.startRestTimer(30);
    vi.advanceTimersByTime(5_000);
    service.addRestTime(15);

    expect(service.restRemainingSeconds()).toBe(40);
    expect(service.restEndsAt()).toBe(Date.now() + 40_000);
  });

  it('skips rest immediately', () => {
    const service = createService();

    service.startRestTimer(30);
    service.skipRestTimer();

    expect(service.isRestActive()).toBe(false);
    expect(service.restEndsAt()).toBeNull();
    expect(service.restRemainingSeconds()).toBeNull();
  });

  it('clears rest when the session is cleared', () => {
    const service = createService();

    service.startSessionTimer();
    service.startRestTimer(30);
    service.clearSession();

    expect(service.sessionStartTime()).toBeNull();
    expect(service.isRestActive()).toBe(false);
    expect(service.restEndsAt()).toBeNull();
  });

  it('persists restEndsAt and restores a future countdown', () => {
    const first = createService();
    first.startSessionTimer();
    first.sessionTitle.set('Push');
    first.startRestTimer(50);
    const restEndsAt = first.restEndsAt();

    TestBed.flushEffects();
    vi.advanceTimersByTime(500);

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(saved.restEndsAt).toBe(restEndsAt);

    first.clearRestTimer();
    first.stopSessionTimer();
    TestBed.resetTestingModule();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    TestBed.configureTestingModule({
      providers: [
        WorkoutService,
        { provide: DbService, useValue: {} },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ZardDialogService, useValue: { create: vi.fn() } },
      ],
    });

    const restored = createService();
    expect(restored.sessionTitle()).toBe('Push');
    expect(restored.restEndsAt()).toBe(restEndsAt);
    expect(restored.isRestActive()).toBe(true);
    expect(restored.restRemainingSeconds()).toBeGreaterThan(0);
  });

  it('drops expired rest when restoring a session', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selectedPlanId: 1,
        selectedSessionId: 2,
        sessionTitle: 'Pull',
        trackedExercises: [],
        sessionStartTime: Date.now() - 5_000,
        sessionDuration: 5,
        restEndsAt: Date.now() - 1_000,
      }),
    );

    const service = createService();

    expect(service.sessionTitle()).toBe('Pull');
    expect(service.sessionStartTime()).not.toBeNull();
    expect(service.restEndsAt()).toBeNull();
    expect(service.isRestActive()).toBe(false);
  });
});

describe('WorkoutService replaceTrackedExercise', () => {
  const saveWorkoutPlan = vi.fn();
  const getWorkoutPlan = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    saveWorkoutPlan.mockReset();
    getWorkoutPlan.mockReset();

    TestBed.configureTestingModule({
      providers: [
        WorkoutService,
        { provide: DbService, useValue: { getWorkoutPlan, saveWorkoutPlan } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ZardDialogService, useValue: { create: vi.fn() } },
      ],
    });
  });

  afterEach(() => {
    const service = TestBed.inject(WorkoutService);
    service.clearRestTimer();
    service.stopSessionTimer();
    localStorage.clear();
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  function createService(): WorkoutService {
    const service = TestBed.inject(WorkoutService);
    TestBed.flushEffects();
    return service;
  }

  function tracked(id: number, name: string): LoggedExercise {
    return {
      id,
      exercise: { id, name, media: [] },
      plannedExercise: {
        id: 50,
        exercise_order: 0,
        exercise_id: id,
        target_sets: 3,
        target_weight: 40,
        target_reps: 8,
      },
      sets: [
        {
          id: id * 10,
          set_number: 1,
          weight_lifted: 40,
          reps_completed: 8,
          completed_at: '2026-10-11T00:00:00.000Z',
          target_weight: 40,
          target_reps: 8,
        },
      ],
    };
  }

  it('swaps in place, moves the logged set, and leaves rest and the clock alone', () => {
    const service = createService();
    service.startSessionTimer();
    service.startRestTimer(40);
    const restEndsAt = service.restEndsAt();
    const sessionStartTime = service.sessionStartTime();
    const bench = tracked(1, 'Bench');
    const squat = tracked(2, 'Squat');
    const row = tracked(3, 'Row');
    service.trackedExercises.set([bench, squat, row]);

    const didReplace = service.replaceTrackedExercise(2, {
      id: 9,
      name: 'Deadlift',
      media: [],
    });

    const exercises = service.trackedExercises();
    expect(didReplace).toBe(true);
    expect(exercises.map((item) => item.exercise.id)).toEqual([1, 9, 3]);
    expect(exercises[1].id).toBe(squat.id);
    expect(exercises[1].sets[0]).toMatchObject({
      weight_lifted: 40,
      reps_completed: 8,
      completed_at: '2026-10-11T00:00:00.000Z',
    });
    expect(exercises[1].sets[0].target_weight).toBeUndefined();
    expect(exercises[1].plannedExercise).toBeUndefined();
    expect(exercises[0]).toBe(bench);
    expect(exercises[2]).toBe(row);
    expect(service.restEndsAt()).toBe(restEndsAt);
    expect(service.sessionStartTime()).toBe(sessionStartTime);
    expect(saveWorkoutPlan).not.toHaveBeenCalled();
  });

  it('fills targets from the saved exercise without writing the routine', () => {
    const service = createService();
    const bench = tracked(1, 'Bench');
    service.trackedExercises.set([bench]);

    service.replaceTrackedExercise(
      1,
      { id: 9, name: 'Incline Press', media: [] },
      { target_sets: 4, target_weight: 50, target_reps: 6, target_rest_time: 120 },
    );

    const next = service.trackedExercises()[0];
    expect(next.plannedExercise).toMatchObject({
      exercise_id: 9,
      target_sets: 4,
      target_weight: 50,
      target_reps: 6,
      target_rest_time: 120,
    });
    expect(next.sets[0].target_weight).toBe(50);
    expect(next.sets[0].weight_lifted).toBe(40);
    expect(saveWorkoutPlan).not.toHaveBeenCalled();
  });

  it('refuses a duplicate or a missing exercise', () => {
    const service = createService();
    const bench = tracked(1, 'Bench');
    const squat = tracked(2, 'Squat');
    service.trackedExercises.set([bench, squat]);

    expect(service.replaceTrackedExercise(2, bench.exercise)).toBe(false);
    expect(service.replaceTrackedExercise(99, { id: 8, name: 'Curl', media: [] })).toBe(false);
    expect(service.trackedExercises().map((item) => item.exercise.id)).toEqual([1, 2]);
  });

  it('persists the swap through the existing session save', () => {
    const service = createService();
    service.startSessionTimer();
    service.startRestTimer(40);
    const restEndsAt = service.restEndsAt();
    service.trackedExercises.set([tracked(1, 'Bench')]);
    service.replaceTrackedExercise(1, { id: 9, name: 'Incline Press', media: [] });

    TestBed.flushEffects();
    vi.advanceTimersByTime(500);

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(saved.trackedExercises[0].exercise.name).toBe('Incline Press');
    expect(saved.trackedExercises[0].sets[0].weight_lifted).toBe(40);
    expect(saved.restEndsAt).toBe(restEndsAt);
  });

  it('reads saved targets from the plan and does not save it', async () => {
    const service = createService();
    const plan: WorkoutPlan = {
      id: 4,
      title: 'Push',
      days: 1,
      sessions: [
        {
          id: 10,
          title: 'Push',
          session_order: 0,
          exercises: [
            {
              id: 1,
              exercise_order: 0,
              exercise_id: 7,
              target_sets: 3,
              target_weight: 40,
              target_reps: 8,
            },
          ],
        },
      ],
    };
    getWorkoutPlan.mockResolvedValue(plan);
    service.selectedPlanId.set(4);
    service.selectedSessionId.set(10);

    await expect(service.savedTargetsForExercise(7)).resolves.toEqual({
      target_sets: 3,
      target_weight: 40,
      target_reps: 8,
      target_rest_time: undefined,
    });
    expect(getWorkoutPlan).toHaveBeenCalledWith(4);
    expect(saveWorkoutPlan).not.toHaveBeenCalled();

    service.selectedPlanId.set(null);
    await expect(service.savedTargetsForExercise(7)).resolves.toBeNull();
  });
});
