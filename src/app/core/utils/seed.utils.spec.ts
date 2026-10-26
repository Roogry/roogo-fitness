import { RESEED_STORE_NAMES, SEED_VERSION } from './seed.constants';
import { shouldReseed } from './seed.utils';

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
    expect(storedAfterFirstLaunch).toBe('2');
    expect(rows['exercises']).toEqual([]);
    expect(rows['muscles']).toEqual([]);
    expect(rows['logged_sessions']).toEqual(['monday']);
    expect(rows['workout_plans']).toEqual(['ppl']);

    const storedAfterSecondLaunch = replaceCatalog(storedAfterFirstLaunch);
    expect(storedAfterSecondLaunch).toBe('2');
    expect(rows['exercises']).toEqual([]);
    expect(rows['muscles']).toEqual([]);
    expect(rows['logged_sessions']).toEqual(['monday']);
    expect(rows['workout_plans']).toEqual(['ppl']);
    expect(SEED_VERSION).toBe(2);
  });
});
