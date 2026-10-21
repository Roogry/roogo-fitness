import { LoggedSet, WorkoutPlan, WorkoutPlanExercise } from '@/shared/models';
import type { ReplacementTargets } from './replace-tracked-exercise.types';

export function hasSavedTargets(
  targets: ReplacementTargets | null | undefined,
): targets is ReplacementTargets {
  if (!targets) return false;
  return (
    targets.target_sets !== undefined ||
    targets.target_weight !== undefined ||
    targets.target_reps !== undefined
  );
}

/**
 * Logged weight, reps, and completed state stay on the set they came from,
 * so they still win over the new exercise's targets in the inputs.
 * Saved targets fill target weight and reps, and add sets up to that count.
 * With no saved targets, the old set count is kept and the target fields are cleared.
 */
export function setsAfterExerciseReplace(
  oldSets: readonly LoggedSet[],
  savedTargets: ReplacementTargets | null,
  createId: (index: number) => number = (index) => Date.now() + index,
): LoggedSet[] {
  const saved = hasSavedTargets(savedTargets) ? savedTargets : null;
  const savedSetCount = saved?.target_sets ?? oldSets.length;
  const setCount = Math.max(oldSets.length, savedSetCount);
  const sets: LoggedSet[] = [];

  for (let index = 0; index < setCount; index++) {
    const previous = oldSets[index];
    const set: LoggedSet = previous
      ? { ...previous, set_number: index + 1 }
      : { id: createId(index), set_number: index + 1 };

    if (saved) {
      set.target_weight = saved.target_weight;
      set.target_reps = saved.target_reps;
      if (saved.target_rest_time !== undefined) {
        set.rest_time_taken_sec = saved.target_rest_time;
      }
    } else if (previous) {
      set.target_weight = undefined;
      set.target_reps = undefined;
    }

    sets.push(set);
  }

  return sets;
}

/** Undefined when the new exercise has nothing saved, so the session does not invent a plan line. */
export function nextPlannedExercise(
  savedTargets: ReplacementTargets | null,
  exerciseId: number,
  order: number,
  setCount: number,
): WorkoutPlanExercise | undefined {
  if (!hasSavedTargets(savedTargets)) return undefined;

  return {
    id: order,
    exercise_order: order,
    exercise_id: exerciseId,
    target_sets: savedTargets.target_sets ?? setCount,
    target_weight: savedTargets.target_weight,
    target_reps: savedTargets.target_reps,
    target_rest_time: savedTargets.target_rest_time,
  };
}

/**
 * Prefer the session that is running, then any other day in the same plan.
 * Returns null when this exercise is not in the routine.
 */
export function findSavedExerciseTargets(
  plan: WorkoutPlan | null | undefined,
  exerciseId: number,
  preferredSessionId: number | null,
): ReplacementTargets | null {
  if (!plan?.sessions?.length) return null;

  const preferred = plan.sessions.find((session) => session.id === preferredSessionId);
  const ordered = preferred
    ? [preferred, ...plan.sessions.filter((session) => session.id !== preferredSessionId)]
    : plan.sessions;

  for (const session of ordered) {
    const match = session.exercises?.find((planned) => planned.exercise_id === exerciseId);
    if (!match) continue;
    return {
      target_sets: match.target_sets,
      target_weight: match.target_weight,
      target_reps: match.target_reps,
      target_rest_time: match.target_rest_time,
    };
  }

  return null;
}
