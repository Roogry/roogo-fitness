interface PlanExerciseRef {
  exercise_id: number;
}

interface SplitPlanExercises<T extends PlanExerciseRef> {
  found: T[];
  missing: T[];
}

/**
 * Splits planned rows into exercises still in the catalog and exercises that were removed.
 * Each list keeps the plan order.
 */
export function splitPlanExercises<T extends PlanExerciseRef>(
  planned: readonly T[],
  catalog: ReadonlyMap<number, unknown>,
): SplitPlanExercises<T> {
  const found: T[] = [];
  const missing: T[] = [];

  for (const plannedExercise of planned) {
    if (catalog.has(plannedExercise.exercise_id)) {
      found.push(plannedExercise);
    } else {
      missing.push(plannedExercise);
    }
  }

  return { found, missing };
}

/** Short line shown when a plan session still points at removed exercises. */
export function skippedPlanExerciseNote(missingCount: number): string | null {
  if (missingCount < 1) return null;
  return `${missingCount} exercise(s) no longer exist and were skipped`;
}

/**
 * Waits until every planned id has been looked up.
 * During that load the catalog is empty, and every row would look missing.
 */
export function skippedPlanExerciseNoteFor(
  planned: readonly PlanExerciseRef[],
  catalog: ReadonlyMap<number, unknown>,
  checkedExerciseIds: ReadonlySet<number>,
): string | null {
  for (const plannedExercise of planned) {
    if (!checkedExerciseIds.has(plannedExercise.exercise_id)) return null;
  }

  return skippedPlanExerciseNote(splitPlanExercises(planned, catalog).missing.length);
}

/** True when two id lists are the same length and the same ids in the same order. */
export function sameExerciseIdList(left: readonly number[], right: readonly number[]): boolean {
  if (left.length !== right.length) return false;

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }

  return true;
}
