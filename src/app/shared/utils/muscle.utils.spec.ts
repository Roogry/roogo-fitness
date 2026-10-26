import { DEFAULT_MUSCLE_ICON } from '@/shared/constants/muscle.constants';
import { muscleIconUrl } from './muscle.utils';

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
