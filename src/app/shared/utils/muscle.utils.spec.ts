import { DEFAULT_MUSCLE_ICON } from '@/shared/constants/muscle.constants';
import { Muscle } from '@/shared/models';
import { muscleIconUrl, sortMuscles } from './muscle.utils';

describe('muscleIconUrl', () => {
  it('returns the icon path when it is set', () => {
    expect(muscleIconUrl({ icon_url: 'assets/images/muscles/lats_mucle.webp' })).toBe(
      'assets/images/muscles/lats_mucle.webp',
    );
  });

  it('returns the placeholder for a missing, empty, or blank path', () => {
    expect(muscleIconUrl(undefined)).toBe(DEFAULT_MUSCLE_ICON);
    expect(muscleIconUrl(null)).toBe(DEFAULT_MUSCLE_ICON);
    expect(muscleIconUrl({})).toBe(DEFAULT_MUSCLE_ICON);
    expect(muscleIconUrl({ icon_url: '' })).toBe(DEFAULT_MUSCLE_ICON);
    expect(muscleIconUrl({ icon_url: '   ' })).toBe(DEFAULT_MUSCLE_ICON);
  });
});

describe('sortMuscles', () => {
  const biceps: Muscle = { id: 8, name: 'Biceps', display_order: 9 };
  const triceps: Muscle = { id: 7, name: 'Triceps', display_order: 10 };
  const forearms: Muscle = { id: 16, name: 'Forearms', display_order: 11 };
  const neck: Muscle = { id: 17, name: 'Neck', display_order: 1 };

  it('orders muscles by display_order, with Forearms after the other arm muscles', () => {
    const sorted = sortMuscles([forearms, neck, triceps, biceps]);

    expect(sorted.map((muscle) => muscle.name)).toEqual(['Neck', 'Biceps', 'Triceps', 'Forearms']);
  });

  it('falls back to id when display_order is missing or not a finite number', () => {
    const upperChest: Muscle = { id: 1, name: 'Upper Chest' };
    const middleChest: Muscle = { id: 2, name: 'Middle Chest', display_order: Number.NaN };
    const calves: Muscle = { id: 14, name: 'Calves', display_order: 20 };

    const sorted = sortMuscles([calves, middleChest, upperChest]);

    expect(sorted.map((muscle) => muscle.name)).toEqual(['Upper Chest', 'Middle Chest', 'Calves']);
  });

  it('breaks equal display orders by id and does not change the input list', () => {
    const later: Muscle = { id: 20, name: 'Later', display_order: 4 };
    const earlier: Muscle = { id: 3, name: 'Earlier', display_order: 4 };
    const input = [later, earlier];

    expect(sortMuscles(input).map((muscle) => muscle.id)).toEqual([3, 20]);
    expect(input.map((muscle) => muscle.id)).toEqual([20, 3]);
  });
});
