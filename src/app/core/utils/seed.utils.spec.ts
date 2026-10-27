import { ExerciseSeed } from '@/shared/models';
import { RESEED_STORE_NAMES, SEED_VERSION } from './seed.constants';
import { findMissingMuscleRefs, isExerciseSeed, shouldReseed } from './seed.utils';

describe('shouldReseed', () => {
  it('reseeds when the stored version is missing, older, or not a number', () => {
    expect(shouldReseed(null, 2)).toBe(true);
    expect(shouldReseed('1', 2)).toBe(true);
    expect(shouldReseed('abc', 2)).toBe(true);
  });

  it('skips the reseed when the stored version is already 2', () => {
    expect(shouldReseed('2', 2)).toBe(false);
  });

  it('reseeds once when the version changes, then stops', () => {
    const storedBefore = '1';
    expect(shouldReseed(storedBefore, SEED_VERSION)).toBe(true);

    const storedAfterReseed = String(SEED_VERSION);
    expect(shouldReseed(storedAfterReseed, SEED_VERSION)).toBe(false);
  });

  it('clears the catalog once when the version changes and leaves sessions and plans alone', () => {
    const rows: Record<string, string[]> = {
      exercises: ['old-quad'],
      muscles: ['old-core'],
      logged_sessions: ['monday'],
      workout_plans: ['ppl'],
    };

    const replaceCatalog = (storedVersion: string | null): string | null => {
      if (!shouldReseed(storedVersion, SEED_VERSION)) return storedVersion;
      for (const storeName of RESEED_STORE_NAMES) {
        rows[storeName] = [];
      }
      return String(SEED_VERSION);
    };

    const storedAfterFirstLaunch = replaceCatalog(null);
    expect(storedAfterFirstLaunch).toBe('4');
    expect(rows['exercises']).toEqual([]);
    expect(rows['muscles']).toEqual([]);
    expect(rows['logged_sessions']).toEqual(['monday']);
    expect(rows['workout_plans']).toEqual(['ppl']);

    const storedAfterSecondLaunch = replaceCatalog(storedAfterFirstLaunch);
    expect(storedAfterSecondLaunch).toBe('4');
    expect(rows['exercises']).toEqual([]);
    expect(rows['muscles']).toEqual([]);
    expect(rows['logged_sessions']).toEqual(['monday']);
    expect(rows['workout_plans']).toEqual(['ppl']);
    expect(SEED_VERSION).toBe(4);
  });
});

function validSeed(): ExerciseSeed {
  return {
    seed_version: 3,
    muscles: [{ id: 1, name: 'Upper Chest' }],
    exercises: [
      {
        id: 100,
        name: 'Press',
        media: [],
        primary_muscle: { id: 1, name: 'Upper Chest' },
        secondary_muscles: [],
      },
    ],
  };
}

describe('isExerciseSeed', () => {
  it('accepts a minimal valid seed', () => {
    expect(isExerciseSeed(validSeed())).toBe(true);
  });

  it('rejects null, an empty object, an empty exercise list, and an exercise without media', () => {
    expect(isExerciseSeed(null)).toBe(false);
    expect(isExerciseSeed({})).toBe(false);
    expect(isExerciseSeed({ ...validSeed(), exercises: [] })).toBe(false);

    const missingMedia = validSeed();
    const exercise: { id: number; name: string; media?: unknown } = {
      id: missingMedia.exercises[0].id,
      name: missingMedia.exercises[0].name,
    };
    expect(isExerciseSeed({ ...missingMedia, exercises: [exercise] })).toBe(false);
  });
});

describe('findMissingMuscleRefs', () => {
  it('returns an empty list when every muscle id is in the seed', () => {
    expect(findMissingMuscleRefs(validSeed())).toEqual([]);
  });

  it('returns the exercise ids that point at a muscle outside the list, in plan order', () => {
    const seed = validSeed();
    seed.exercises.push({
      id: 101,
      name: 'Curl',
      media: [],
      primary_muscle: { id: 16, name: 'Forearms' },
      secondary_muscles: [{ id: 8, name: 'Biceps' }],
    });
    seed.exercises.push({
      id: 102,
      name: 'Row',
      media: [],
      primary_muscle: { id: 1, name: 'Upper Chest' },
      secondary_muscles: [{ id: 18, name: 'Lower Back' }],
    });

    expect(findMissingMuscleRefs(seed)).toEqual([101, 102]);
  });
});
