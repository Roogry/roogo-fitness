import { Exercise } from '@/shared/models';
import {
  completedSetCount,
  filterExercisesByName,
  replaceLoggedSetsMessage,
  sortReplacementCandidates,
} from './replace-exercise';

function exercise(
  id: number,
  name: string,
  primaryId?: number,
  secondaryIds: number[] = [],
): Exercise {
  return {
    id,
    name,
    media: [],
    primary_muscle:
      primaryId === undefined ? undefined : { id: primaryId, name: `Muscle ${primaryId}` },
    secondary_muscles: secondaryIds.map((muscleId) => ({
      id: muscleId,
      name: `Muscle ${muscleId}`,
    })),
  };
}

describe('sortReplacementCandidates', () => {
  const source = exercise(1, 'Bench Press', 10);

  it('lists the same primary muscle, then a secondary match, then the rest', () => {
    const catalog = [
      exercise(5, 'Squat', 20),
      exercise(4, 'Fly', 30, [10]),
      exercise(1, 'Bench Press', 10),
      exercise(3, 'Zebra Press', 10),
      exercise(2, 'Incline Press', 10),
      exercise(6, 'Alpha Curl', 40, [10]),
    ];

    const sorted = sortReplacementCandidates(catalog, source, new Set([1]));

    expect(sorted.map((item) => item.name)).toEqual([
      'Incline Press',
      'Zebra Press',
      'Alpha Curl',
      'Fly',
      'Squat',
    ]);
  });

  it('sorts by name when the source has no primary muscle', () => {
    const sorted = sortReplacementCandidates(
      [exercise(3, 'Squat', 20), exercise(2, 'Curl', 30)],
      exercise(1, 'Custom'),
      new Set([1]),
    );

    expect(sorted.map((item) => item.id)).toEqual([2, 3]);
  });

  it('keeps that order while filtering by name', () => {
    const sorted = sortReplacementCandidates(
      [
        exercise(3, 'Squat', 20),
        exercise(4, 'Cable Fly', 30, [10]),
        exercise(2, 'Incline Press', 10),
      ],
      source,
      new Set<number>(),
    );

    expect(filterExercisesByName(sorted, 'press').map((item) => item.name)).toEqual([
      'Incline Press',
    ]);
    expect(filterExercisesByName(sorted, '  ').map((item) => item.id)).toEqual([2, 4, 3]);
  });
});

describe('replace confirm copy', () => {
  it('counts only sets that were marked done', () => {
    expect(
      completedSetCount([{ completed_at: '2026-10-11T00:00:00.000Z' }, {}, { completed_at: '' }]),
    ).toBe(1);
  });

  it('uses the singular when one set is logged', () => {
    expect(replaceLoggedSetsMessage(1)).toBe(
      "You've logged 1 set. Their weight and reps will move to the new exercise.",
    );
  });

  it('uses the plural when more than one set is logged', () => {
    expect(replaceLoggedSetsMessage(2)).toBe(
      "You've logged 2 sets. Their weight and reps will move to the new exercise.",
    );
  });
});
