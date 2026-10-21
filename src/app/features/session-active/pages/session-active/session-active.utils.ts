import { LoggedExercise } from '@/shared/models';

/**
 * Highest-index exercise that has at least one set with `completed_at`.
 * List order is the session order, so the last match is where logging left off.
 */
export function lastExerciseIdWithCompletedSet(
  exercises: readonly LoggedExercise[],
): number | null {
  for (let index = exercises.length - 1; index >= 0; index--) {
    const tracked = exercises[index];
    if (tracked.sets.some((set) => !!set.completed_at)) {
      return tracked.exercise.id;
    }
  }
  return null;
}
