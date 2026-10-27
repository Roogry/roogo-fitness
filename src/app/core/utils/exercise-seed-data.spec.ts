import rawSeed from '../../../assets/data/exercises.json';
import { DEFAULT_MUSCLE_ICON } from '@/shared/constants/muscle.constants';
import { Exercise, ExerciseSeed } from '@/shared/models';
import { sortMuscles } from '@/shared/utils/muscle.utils';
import { mockWorkoutPlans } from '../mocks/workout-plan.mock';
import { SEED_VERSION } from './seed.constants';
import { findMissingMuscleRefs, isExerciseSeed } from './seed.utils';

const LEGACY_SEEDED_EXERCISE_ID_MIN = 100;
const LEGACY_SEEDED_EXERCISE_ID_MAX = 140;
const INSTRUCTION_COUNT_MIN = 4;
const INSTRUCTION_COUNT_MAX = 6;
const EXERCISE_ID_MIN = 100;
const EXERCISE_ID_MAX = 402;
const EXERCISE_COUNT = 303;
const MUSCLE_COUNT = 20;

const SEEDED_MUSCLE_ICONS = [
  'assets/images/muscles/upper_chest_mucle.webp',
  'assets/images/muscles/middle_chest_mucle.webp',
  'assets/images/muscles/lower_chest_mucle.webp',
  'assets/images/muscles/front_delt_mucle.webp',
  'assets/images/muscles/side_delt_mucle.webp',
  'assets/images/muscles/rear_delt_mucle.webp',
  'assets/images/muscles/triceps_mucle.webp',
  'assets/images/muscles/biceps_mucle.webp',
  'assets/images/muscles/lats_mucle.webp',
  'assets/images/muscles/traps_mucle.webp',
  'assets/images/muscles/quadriceps_mucle.webp',
  'assets/images/muscles/hamstrings_mucle.webp',
  'assets/images/muscles/gluteus_mucle.webp',
  'assets/images/muscles/calves_mucle.webp',
  'assets/images/muscles/core_mucle.webp',
];

const NEW_MUSCLES = [
  { id: 16, name: 'Forearms' },
  { id: 17, name: 'Neck' },
  { id: 18, name: 'Lower Back' },
  { id: 19, name: 'Adductors' },
  { id: 20, name: 'Abductors' },
];

/** Body-region order. Muscle ids stay 1–20; this is display_order 1 through 20. */
const MUSCLE_DISPLAY_NAMES = [
  'Neck',
  'Traps',
  'Upper Chest',
  'Middle Chest',
  'Lower Chest',
  'Front Delt',
  'Side Delt',
  'Back Delt',
  'Biceps',
  'Triceps',
  'Forearms',
  'Lats',
  'Lower Back',
  'Core',
  'Gluteus',
  'Abductors',
  'Adductors',
  'Quadriceps',
  'Hamstrings',
  'Calves',
];

const RANGE_FIELDS = [
  'recommended_warmup_sets',
  'recommended_working_sets',
  'recommended_rpe',
  'recommended_rest_time_sec',
] as const;

function loadSeed(): ExerciseSeed {
  const parsed: unknown = rawSeed;
  if (!isExerciseSeed(parsed)) {
    throw new Error('exercises.json failed seed validation');
  }
  return parsed;
}

const seed = loadSeed();

describe('exercises.json', () => {
  it('matches this build and the seed guard', () => {
    expect(seed.seed_version).toBe(SEED_VERSION);
    expect(isExerciseSeed(rawSeed)).toBe(true);
    expect(findMissingMuscleRefs(seed)).toEqual([]);
  });

  it('has 20 muscles with ids 1 through 20 and the five new names', () => {
    expect(seed.muscles).toHaveLength(MUSCLE_COUNT);

    const muscleIds = seed.muscles.map((muscle) => muscle.id).sort((left, right) => left - right);
    expect(new Set(muscleIds).size).toBe(muscleIds.length);
    expect(muscleIds).toEqual(Array.from({ length: MUSCLE_COUNT }, (_, index) => index + 1));

    for (const expected of NEW_MUSCLES) {
      const muscle = seed.muscles.find((item) => item.id === expected.id);
      expect(muscle?.name).toBe(expected.name);
      expect(muscle?.icon_url).toBe(DEFAULT_MUSCLE_ICON);
    }

    expect(seed.muscles.some((muscle) => muscle.name === 'Midle Chest')).toBe(false);
  });

  it('lists muscles by body region, with Forearms next to the other arm muscles', () => {
    const ordered = sortMuscles(seed.muscles);

    expect(ordered.map((muscle) => muscle.name)).toEqual(MUSCLE_DISPLAY_NAMES);
    expect(ordered.map((muscle) => muscle.display_order)).toEqual(
      MUSCLE_DISPLAY_NAMES.map((_, index) => index + 1),
    );
    expect(ordered.find((muscle) => muscle.name === 'Forearms')?.id).toBe(16);
    expect(ordered.find((muscle) => muscle.name === 'Neck')?.id).toBe(17);
  });

  it('uses an existing muscle icon or the shared placeholder', () => {
    const allowedIcons = new Set<string>([...SEEDED_MUSCLE_ICONS, DEFAULT_MUSCLE_ICON]);
    for (const muscle of seed.muscles) {
      expect(allowedIcons.has(muscle.icon_url ?? ''), muscle.name).toBe(true);
    }
  });

  it('has 303 unique exercises from id 100 through 402', () => {
    expect(seed.exercises).toHaveLength(EXERCISE_COUNT);

    const exerciseIds = seed.exercises.map((exercise) => exercise.id);
    expect(new Set(exerciseIds).size).toBe(exerciseIds.length);
    expect(Math.min(...exerciseIds)).toBe(EXERCISE_ID_MIN);
    expect(Math.max(...exerciseIds)).toBe(EXERCISE_ID_MAX);
  });

  it('keeps muscle names in sync and does not repeat a primary muscle as secondary', () => {
    const musclesById = new Map(seed.muscles.map((muscle) => [muscle.id, muscle]));

    for (const exercise of seed.exercises) {
      const primary = exercise.primary_muscle;
      expect(primary, `${exercise.id} ${exercise.name}`).toBeTruthy();

      const primaryMuscle = musclesById.get(primary?.id ?? -1);
      expect(primaryMuscle?.name, `${exercise.id} primary`).toBe(primary?.name);
      expect(primary?.name ?? '').not.toContain('Midle');

      for (const secondary of exercise.secondary_muscles ?? []) {
        const secondaryMuscle = musclesById.get(secondary.id);
        expect(secondaryMuscle?.name, `${exercise.id} secondary`).toBe(secondary.name);
        expect(secondary.id, `${exercise.id} repeats primary`).not.toBe(primary?.id);
        expect(secondary.name).not.toContain('Midle');
      }
    }
  });

  it('gives every exercise tips, 4 to 6 instructions, and ranges with min at most max', () => {
    for (const exercise of seed.exercises) {
      expect(typeof exercise.tips, exercise.name).toBe('string');
      expect(Array.isArray(exercise.instructions), exercise.name).toBe(true);

      const stepCount = exercise.instructions?.length ?? 0;
      const isLegacy =
        exercise.id >= LEGACY_SEEDED_EXERCISE_ID_MIN &&
        exercise.id <= LEGACY_SEEDED_EXERCISE_ID_MAX;
      if (!isLegacy) {
        expect(stepCount, exercise.name).toBeGreaterThanOrEqual(INSTRUCTION_COUNT_MIN);
        expect(stepCount, exercise.name).toBeLessThanOrEqual(INSTRUCTION_COUNT_MAX);
      }

      for (const step of exercise.instructions ?? []) {
        expect(typeof step, exercise.name).toBe('string');
      }

      expectRanges(exercise);
    }
  });

  it('includes every exercise referenced by the default workout plan', () => {
    const exerciseIds = new Set(seed.exercises.map((exercise) => exercise.id));
    const referencedIds = mockWorkoutPlans.flatMap((plan) =>
      plan.sessions.flatMap((session) =>
        (session.exercises ?? []).map((planned) => planned.exercise_id),
      ),
    );

    expect(referencedIds.length).toBeGreaterThan(0);
    for (const exerciseId of referencedIds) {
      expect(exerciseIds.has(exerciseId), `plan references ${exerciseId}`).toBe(true);
    }
  });
});

function expectRanges(exercise: Exercise): void {
  for (const field of RANGE_FIELDS) {
    const range = exercise[field];
    expect(range, `${exercise.id} ${field}`).toBeTruthy();
    expect(typeof range?.min, `${exercise.id} ${field} min`).toBe('number');
    expect(typeof range?.max, `${exercise.id} ${field} max`).toBe('number');
    expect(range!.min, `${exercise.id} ${field}`).toBeLessThanOrEqual(range!.max);
  }
}
