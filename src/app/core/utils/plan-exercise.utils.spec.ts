import {
  sameExerciseIdList,
  skippedPlanExerciseNote,
  skippedPlanExerciseNoteFor,
  splitPlanExercises,
} from './plan-exercise.utils';

const planned = [
  { exercise_id: 10, label: 'a' },
  { exercise_id: 11, label: 'b' },
  { exercise_id: 12, label: 'c' },
  { exercise_id: 13, label: 'd' },
];

const catalog = new Map<number, string>([
  [12, 'c'],
  [10, 'a'],
]);

describe('splitPlanExercises', () => {
  it('keeps found and missing rows in plan order', () => {
    const split = splitPlanExercises(planned, catalog);

    expect(split.found.map((item) => item.label)).toEqual(['a', 'c']);
    expect(split.missing.map((item) => item.label)).toEqual(['b', 'd']);
  });
});

describe('skippedPlanExerciseNote', () => {
  it('builds the skipped line and stays quiet when nothing is missing', () => {
    expect(skippedPlanExerciseNote(0)).toBeNull();
    expect(skippedPlanExerciseNote(1)).toBe('1 exercise(s) no longer exist and were skipped');
    expect(skippedPlanExerciseNote(2)).toBe('2 exercise(s) no longer exist and were skipped');
  });

  it('waits until every planned id has been looked up', () => {
    expect(skippedPlanExerciseNoteFor(planned, catalog, new Set())).toBeNull();
    expect(skippedPlanExerciseNoteFor(planned, catalog, new Set([10, 12]))).toBeNull();
    expect(skippedPlanExerciseNoteFor(planned, catalog, new Set([10, 11, 12, 13]))).toBe(
      '2 exercise(s) no longer exist and were skipped',
    );
  });
});

describe('sameExerciseIdList', () => {
  it('matches only the same ids in the same order', () => {
    expect(sameExerciseIdList([1, 2], [1, 2])).toBe(true);
    expect(sameExerciseIdList([1, 2], [2, 1])).toBe(false);
    expect(sameExerciseIdList([1], [1, 2])).toBe(false);
  });
});
