/**
 * Bump when the exercise or muscle seed changes.
 * A different stored value replaces those two stores on the next launch.
 * Version 1 is any install from before this key existed.
 */
export const SEED_VERSION = 2;

/** localStorage key for the seed that was last written. */
export const SEED_VERSION_STORAGE_KEY = 'roogo.seedVersion';

/**
 * Stores replaced when the seed version changes.
 * Logged sessions and workout plans stay: a session keeps its own copy of each exercise,
 * and the seeded plan points at exercise ids that do not change.
 */
export const RESEED_STORE_NAMES = ['exercises', 'muscles'] as const;
