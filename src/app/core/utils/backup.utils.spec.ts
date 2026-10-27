import { SEED_VERSION } from './seed.constants';
import { isBackupFile } from './backup.utils';

const collections = {
  workout_plans: [],
  logged_sessions: [],
  exercises: [],
  muscles: [],
};

describe('isBackupFile', () => {
  it('accepts a version 1 backup that has no seed version', () => {
    expect(isBackupFile({ version: 1, ...collections })).toBe(true);
  });

  it('accepts a version 2 backup that records the seed version', () => {
    expect(isBackupFile({ version: 2, seed_version: SEED_VERSION, ...collections })).toBe(true);
  });

  it('rejects a different version, a missing collection, and a non-numeric seed version', () => {
    expect(isBackupFile({ version: 3, ...collections })).toBe(false);
    expect(isBackupFile({ version: 1, logged_sessions: [], exercises: [], muscles: [] })).toBe(
      false,
    );
    expect(isBackupFile({ version: 2, seed_version: '3', ...collections })).toBe(false);
    expect(isBackupFile(null)).toBe(false);
  });
});
