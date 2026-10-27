import { ExerciseSeed } from '@/shared/models';

/**
 * True when the stored seed is missing, not a whole number, or not this build's version.
 * A missing key is an install from before seed versions existed, so it reseeds once.
 */
export function shouldReseed(storedVersion: string | null, currentVersion: number): boolean {
  if (storedVersion === null) return true;
  if (!/^\d+$/.test(storedVersion)) return true;
  return Number(storedVersion) !== currentVersion;
}

function isRecord(data: unknown): data is Record<string, unknown> {
  return typeof data === 'object' && data !== null;
}

function isNonEmptyArray(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length > 0;
}

function isSeedExercise(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    typeof value['id'] === 'number' &&
    typeof value['name'] === 'string' &&
    Array.isArray(value['media'])
  );
}

/** True when the payload has a version plus at least one muscle and one exercise row. */
export function isExerciseSeed(data: unknown): data is ExerciseSeed {
  if (!isRecord(data)) return false;
  if (typeof data['seed_version'] !== 'number') return false;
  if (!isNonEmptyArray(data['muscles']) || !isNonEmptyArray(data['exercises'])) return false;
  return data['exercises'].every(isSeedExercise);
}

/** Exercise ids whose primary or secondary muscle is not in the seed's muscle list. */
export function findMissingMuscleRefs(seed: ExerciseSeed): number[] {
  const muscleIds = new Set(seed.muscles.map((muscle) => muscle.id));
  const missingExerciseIds: number[] = [];

  for (const exercise of seed.exercises) {
    const referencedIds: number[] = [];
    if (exercise.primary_muscle) referencedIds.push(exercise.primary_muscle.id);
    for (const secondary of exercise.secondary_muscles ?? []) {
      referencedIds.push(secondary.id);
    }

    const isMissing = referencedIds.some((muscleId) => !muscleIds.has(muscleId));
    if (isMissing) missingExerciseIds.push(exercise.id);
  }

  return missingExerciseIds;
}
