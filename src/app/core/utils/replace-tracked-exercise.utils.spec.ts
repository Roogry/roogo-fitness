import { LoggedSet, WorkoutPlan } from '@/shared/models';
import {
  findSavedExerciseTargets,
  setsAfterExerciseReplace,
} from './replace-tracked-exercise.utils';

function loggedSet(partial: Partial<LoggedSet> & Pick<LoggedSet, 'id' | 'set_number'>): LoggedSet {
  return partial;
}

describe('setsAfterExerciseReplace', () => {
  const createId = (index: number) => 800 + index;

  it('keeps logged weight, reps, and completed state on completed sets', () => {
    const oldSets = [
      loggedSet({
        id: 1,
        set_number: 1,
        weight_lifted: 40,
        reps_completed: 8,
        completed_at: '2026-10-11T00:00:00.000Z',
        target_weight: 30,
        target_reps: 10,
        is_warmup: false,
        rest_time_taken_sec: 90,
      }),
    ];

    const sets = setsAfterExerciseReplace(oldSets, null, createId);

    expect(sets).toHaveLength(1);
    expect(sets[0]).toMatchObject({
      id: 1,
      set_number: 1,
      weight_lifted: 40,
      reps_completed: 8,
      completed_at: '2026-10-11T00:00:00.000Z',
      is_warmup: false,
      rest_time_taken_sec: 90,
    });
    expect(sets[0].target_weight).toBeUndefined();
    expect(sets[0].target_reps).toBeUndefined();
    expect(oldSets[0].target_weight).toBe(30);
  });

  it('resets unfinished pre-filled sets to the new exercise targets', () => {
    const oldSets = [
      loggedSet({
        id: 1,
        set_number: 1,
        weight_lifted: 80,
        reps_completed: 8,
        target_weight: 80,
        target_reps: 8,
        rest_time_taken_sec: 90,
        is_warmup: true,
      }),
    ];

    const sets = setsAfterExerciseReplace(
      oldSets,
      { target_sets: 1, target_weight: 12, target_reps: 15, target_rest_time: 60 },
      createId,
    );

    expect(sets).toEqual([
      {
        id: 1,
        set_number: 1,
        weight_lifted: 12,
        reps_completed: 15,
        target_weight: 12,
        target_reps: 15,
        rest_time_taken_sec: 60,
      },
    ]);
  });

  it('clears unfinished sets when the new exercise has no saved targets', () => {
    const oldSets = [
      loggedSet({
        id: 1,
        set_number: 1,
        weight_lifted: 80,
        reps_completed: 8,
        target_weight: 80,
        target_reps: 8,
        rest_time_taken_sec: 90,
      }),
      loggedSet({
        id: 2,
        set_number: 2,
        weight_lifted: 80,
        reps_completed: 8,
        completed_at: '2026-10-11T00:00:00.000Z',
        target_weight: 80,
        target_reps: 8,
      }),
    ];

    const sets = setsAfterExerciseReplace(oldSets, null, createId);

    expect(sets).toHaveLength(2);
    expect(sets[0]).toEqual({ id: 1, set_number: 1 });
    expect(sets[1]).toMatchObject({
      id: 2,
      weight_lifted: 80,
      reps_completed: 8,
      completed_at: '2026-10-11T00:00:00.000Z',
    });
    expect(sets[1].target_weight).toBeUndefined();
    expect(sets[1].target_reps).toBeUndefined();
  });

  it('fills targets from the new exercise and adds sets up to the saved count', () => {
    const oldSets = [
      loggedSet({
        id: 1,
        set_number: 1,
        weight_lifted: 100,
        reps_completed: 3,
        completed_at: '2026-10-11T00:00:00.000Z',
        target_weight: 80,
        target_reps: 5,
      }),
    ];

    const sets = setsAfterExerciseReplace(
      oldSets,
      { target_sets: 3, target_weight: 60, target_reps: 8, target_rest_time: 120 },
      createId,
    );

    expect(sets.map((set) => set.id)).toEqual([1, 801, 802]);
    expect(sets[0]).toMatchObject({
      weight_lifted: 100,
      reps_completed: 3,
      completed_at: '2026-10-11T00:00:00.000Z',
      target_weight: 60,
      target_reps: 8,
      rest_time_taken_sec: 120,
    });
    expect(sets[1]).toEqual({
      id: 801,
      set_number: 2,
      weight_lifted: 60,
      reps_completed: 8,
      target_weight: 60,
      target_reps: 8,
      rest_time_taken_sec: 120,
    });
    expect(sets[2]).toMatchObject({
      set_number: 3,
      weight_lifted: 60,
      reps_completed: 8,
    });
    expect(sets[2].completed_at).toBeUndefined();
  });

  it('does not drop sets when the saved set count is smaller', () => {
    const oldSets = [
      loggedSet({
        id: 1,
        set_number: 1,
        weight_lifted: 20,
        reps_completed: 10,
        completed_at: '2026-10-11T00:00:00.000Z',
      }),
      loggedSet({ id: 2, set_number: 2, weight_lifted: 80, reps_completed: 8 }),
    ];

    const sets = setsAfterExerciseReplace(
      oldSets,
      { target_sets: 1, target_weight: 15, target_reps: 12 },
      createId,
    );

    expect(sets).toHaveLength(2);
    expect(sets[0].weight_lifted).toBe(20);
    expect(sets[0].completed_at).toBe('2026-10-11T00:00:00.000Z');
    expect(sets[1]).toMatchObject({
      id: 2,
      weight_lifted: 15,
      reps_completed: 12,
      target_weight: 15,
      target_reps: 12,
    });
    expect(sets[1].completed_at).toBeUndefined();
  });
});

describe('findSavedExerciseTargets', () => {
  const plan: WorkoutPlan = {
    id: 1,
    title: 'PPL',
    days: 2,
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
            target_rest_time: 90,
          },
        ],
      },
      {
        id: 11,
        title: 'Pull',
        session_order: 1,
        exercises: [
          {
            id: 2,
            exercise_order: 0,
            exercise_id: 7,
            target_sets: 5,
            target_weight: 99,
            target_reps: 4,
          },
          {
            id: 3,
            exercise_order: 1,
            exercise_id: 8,
            target_sets: 4,
            target_weight: 50,
            target_reps: 6,
          },
        ],
      },
    ],
  };

  it('prefers the running session over another day in the plan', () => {
    expect(findSavedExerciseTargets(plan, 7, 10)).toEqual({
      target_sets: 3,
      target_weight: 40,
      target_reps: 8,
      target_rest_time: 90,
    });
  });

  it('uses another session when the running one does not include the exercise', () => {
    expect(findSavedExerciseTargets(plan, 8, 10)).toEqual({
      target_sets: 4,
      target_weight: 50,
      target_reps: 6,
      target_rest_time: undefined,
    });
  });

  it('returns null when the exercise is not in the routine', () => {
    expect(findSavedExerciseTargets(plan, 99, 10)).toBeNull();
    expect(findSavedExerciseTargets(undefined, 7, 10)).toBeNull();
  });
});
