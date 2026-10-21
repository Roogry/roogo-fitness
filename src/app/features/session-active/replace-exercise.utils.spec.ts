import { Exercise } from '@/shared/models';
import { filterExercisesByName, sortReplacementCandidates } from './replace-exercise.utils';

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
