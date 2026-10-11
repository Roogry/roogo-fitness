import { Exercise, LoggedSet } from '@/shared/models';

const PRIMARY_MUSCLE_RANK = 0;
const SECONDARY_MUSCLE_RANK = 1;
const OTHER_MUSCLE_RANK = 2;

export function completedSetCount(sets: readonly Pick<LoggedSet, 'completed_at'>[]): number {
  return sets.filter((set) => !!set.completed_at).length;
}

export function replaceLoggedSetsMessage(completedSets: number): string {
  const setLabel = completedSets === 1 ? '1 set' : `${completedSets} sets`;
  return `You've logged ${setLabel}. Their weight and reps will move to the new exercise.`;
}

/**
 * Same primary muscle, then a secondary muscle that matches that primary, then the rest.
 * Exercises already in the session are left out. Order inside a group is by name.
 */
export function sortReplacementCandidates(
  exercises: readonly Exercise[],
  source: Exercise,
  excludedIds: ReadonlySet<number>,
): Exercise[] {
  const primaryMuscleId = source.primary_muscle?.id;

  return exercises
    .filter((exercise) => !excludedIds.has(exercise.id))
    .slice()
    .sort((left, right) => {
      const byRank =
        replacementRank(left, primaryMuscleId) - replacementRank(right, primaryMuscleId);
      if (byRank !== 0) return byRank;
      const byName = left.name.localeCompare(right.name);
      if (byName !== 0) return byName;
      return left.id - right.id;
    });
}

export function filterExercisesByName(exercises: readonly Exercise[], query: string): Exercise[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...exercises];
  return exercises.filter((exercise) => exercise.name.toLowerCase().includes(needle));
}

function replacementRank(exercise: Exercise, primaryMuscleId: number | undefined): number {
  if (primaryMuscleId === undefined) return OTHER_MUSCLE_RANK;
  if (exercise.primary_muscle?.id === primaryMuscleId) return PRIMARY_MUSCLE_RANK;

  const secondaryMatches = exercise.secondary_muscles?.some(
    (muscle) => muscle.id === primaryMuscleId,
  );
  if (secondaryMatches) return SECONDARY_MUSCLE_RANK;
  return OTHER_MUSCLE_RANK;
}
