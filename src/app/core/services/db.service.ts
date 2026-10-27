import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';
import {
  WorkoutPlan,
  LoggedSession,
  Exercise,
  Muscle,
  ExerciseSeed,
  BackupFile,
} from '@/shared/models';
import { mockWorkoutPlans } from '../mocks';
import { isBackupFile } from '../utils/backup.utils';
import { CURRENT_BACKUP_VERSION } from '../utils/backup.constants';
import {
  EXERCISE_SEED_URL,
  RESEED_STORE_NAMES,
  SEED_VERSION,
  SEED_VERSION_STORAGE_KEY,
} from '../utils/seed.constants';
import { findMissingMuscleRefs, isExerciseSeed, shouldReseed } from '../utils/seed.utils';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private dbPromise: Promise<IDBPDatabase<any>>;

  constructor() {
    this.requestPersistentStorage();
    this.dbPromise = this.initDb();
  }

  private async requestPersistentStorage() {
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persist();
    }
  }

  private async initDb() {
    const db = await openDB('RoogoFitnessDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('workout_plans')) {
          const plansStore = db.createObjectStore('workout_plans', { keyPath: 'id' });
          plansStore.createIndex('isDefault', 'isDefault');
        }

        if (!db.objectStoreNames.contains('logged_sessions')) {
          const sessionsStore = db.createObjectStore('logged_sessions', { keyPath: 'id' });
          sessionsStore.createIndex('start_time', 'start_time');
        }

        if (!db.objectStoreNames.contains('exercises')) {
          const exercisesStore = db.createObjectStore('exercises', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('muscles')) {
          db.createObjectStore('muscles', { keyPath: 'id' });
        }
      },
    });

    await this.applySeedVersion(db);
    await this.populateInitialData(db);

    return db;
  }

  /**
   * When the seed version changes, replace exercises and muscles from the JSON asset.
   * The stores are cleared only after that file loads and validates.
   * A failed load leaves the old rows and the stored version, so the next launch tries again.
   * Logged sessions and workout plans are not part of this transaction.
   */
  private async applySeedVersion(db: IDBPDatabase<any>): Promise<void> {
    const storedVersion = localStorage.getItem(SEED_VERSION_STORAGE_KEY);
    if (!shouldReseed(storedVersion, SEED_VERSION)) return;

    const seed = await this.fetchExerciseSeed();
    if (!seed) return;

    await this.writeExerciseSeed(db, seed);
  }

  /**
   * Loads the exercise library. Returns null when the file is missing or invalid,
   * so callers can keep the catalog they already have.
   */
  private async fetchExerciseSeed(): Promise<ExerciseSeed | null> {
    try {
      const response = await fetch(EXERCISE_SEED_URL);
      if (!response.ok) {
        console.error(`Exercise seed request failed (${response.status}).`);
        return null;
      }

      const data: unknown = await response.json();
      if (!isExerciseSeed(data)) {
        console.error('Exercise seed failed validation.');
        return null;
      }

      if (data.seed_version !== SEED_VERSION) {
        console.error(
          `Exercise seed version ${data.seed_version} does not match this build (${SEED_VERSION}).`,
        );
        return null;
      }

      const missingMuscleRefs = findMissingMuscleRefs(data);
      if (missingMuscleRefs.length > 0) {
        console.error(
          `Exercise seed references unknown muscles on exercises: ${missingMuscleRefs.join(', ')}.`,
        );
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exercise seed failed to load.', error);
      return null;
    }
  }

  /** Replaces the exercise and muscle stores, then records the seed version. */
  private async writeExerciseSeed(db: IDBPDatabase<any>, seed: ExerciseSeed): Promise<void> {
    const tx = db.transaction([...RESEED_STORE_NAMES], 'readwrite');
    const exerciseStore = tx.objectStore('exercises');
    const muscleStore = tx.objectStore('muscles');
    await exerciseStore.clear();
    await muscleStore.clear();

    for (const muscle of seed.muscles) {
      await muscleStore.put(muscle);
    }
    for (const exercise of seed.exercises) {
      await exerciseStore.put(exercise);
    }

    await tx.done;
    this.rememberSeedVersion();
  }

  /** Written only after a seed succeeds, so a failed write is retried on the next launch. */
  private rememberSeedVersion(): void {
    localStorage.setItem(SEED_VERSION_STORAGE_KEY, String(SEED_VERSION));
  }

  private async populateInitialData(db: IDBPDatabase<any>) {
    const muscleCount = await db.count('muscles');
    const exerciseCount = await db.count('exercises');

    if (muscleCount === 0 || exerciseCount === 0) {
      const seed = await this.fetchExerciseSeed();
      if (!seed) {
        console.error('Exercise seed is unavailable, so the catalog was left unchanged.');
      } else if (muscleCount === 0 && exerciseCount === 0) {
        await this.writeExerciseSeed(db, seed);
      } else {
        const tx = db.transaction([...RESEED_STORE_NAMES], 'readwrite');
        if (muscleCount === 0) {
          for (const muscle of seed.muscles) {
            await tx.objectStore('muscles').put(muscle);
          }
        }
        if (exerciseCount === 0) {
          for (const exercise of seed.exercises) {
            await tx.objectStore('exercises').put(exercise);
          }
        }
        await tx.done;
        this.rememberSeedVersion();
      }
    }

    const plansCount = await db.count('workout_plans');
    if (plansCount === 0) {
      const tx = db.transaction('workout_plans', 'readwrite');
      for (const plan of mockWorkoutPlans) {
        tx.store.put(plan);
      }
      await tx.done;
    }
  }

  async getWorkoutPlans(): Promise<WorkoutPlan[]> {
    const db = await this.dbPromise;
    return db.getAll('workout_plans');
  }

  async getWorkoutPlan(id: number): Promise<WorkoutPlan | undefined> {
    const db = await this.dbPromise;
    return db.get('workout_plans', id);
  }

  async saveWorkoutPlan(plan: WorkoutPlan): Promise<number> {
    const db = await this.dbPromise;
    const now = new Date().toISOString();
    if (!plan.createdAt) plan.createdAt = now;
    plan.updatedAt = now;
    return db.put('workout_plans', plan);
  }

  async deleteWorkoutPlan(id: number): Promise<void> {
    const db = await this.dbPromise;
    return db.delete('workout_plans', id);
  }

  /** Retrieves all logged sessions from the database, sorted by start time descending. */
  async getLoggedSessions(): Promise<LoggedSession[]> {
    const db = await this.dbPromise;
    const sessions = await db.getAllFromIndex('logged_sessions', 'start_time');
    return sessions.reverse();
  }

  async getLoggedSession(id: number): Promise<LoggedSession | undefined> {
    const db = await this.dbPromise;
    return db.get('logged_sessions', id);
  }

  async deleteLoggedSession(id: number): Promise<void> {
    const db = await this.dbPromise;
    return db.delete('logged_sessions', id);
  }

  async saveLoggedSession(session: LoggedSession): Promise<number> {
    const db = await this.dbPromise;
    const now = new Date().toISOString();
    if (!session.createdAt) session.createdAt = now;
    session.updatedAt = now;
    return db.put('logged_sessions', session);
  }

  async getExercises(): Promise<Exercise[]> {
    const db = await this.dbPromise;
    return db.getAll('exercises');
  }

  async getExerciseByKey(key: any): Promise<Exercise | undefined> {
    if (key === undefined || key === null) return undefined;
    const db = await this.dbPromise;
    return db.get('exercises', key);
  }

  async saveExercise(exercise: Exercise): Promise<number> {
    const db = await this.dbPromise;
    const now = new Date().toISOString();
    if (!exercise.createdAt) exercise.createdAt = now;
    exercise.updatedAt = now;
    return db.put('exercises', exercise);
  }

  async getMuscles(): Promise<Muscle[]> {
    const db = await this.dbPromise;
    return db.getAll('muscles');
  }

  async exportBackup(): Promise<BackupFile> {
    const db = await this.dbPromise;
    const workout_plans = await db.getAll('workout_plans');
    const logged_sessions = await db.getAll('logged_sessions');
    const exercises = await db.getAll('exercises');
    const muscles = await db.getAll('muscles');

    return {
      version: CURRENT_BACKUP_VERSION,
      seed_version: SEED_VERSION,
      workout_plans,
      logged_sessions,
      exercises,
      muscles,
    };
  }

  async importBackup(data: unknown): Promise<void> {
    if (!isBackupFile(data)) {
      throw new Error('Invalid backup file structure.');
    }

    const db = await this.dbPromise;
    const tx = db.transaction(
      ['workout_plans', 'logged_sessions', 'exercises', 'muscles'],
      'readwrite',
    );

    await tx.objectStore('workout_plans').clear();
    await tx.objectStore('logged_sessions').clear();
    await tx.objectStore('exercises').clear();
    await tx.objectStore('muscles').clear();

    for (const plan of data.workout_plans) {
      await tx.objectStore('workout_plans').put(plan);
    }
    for (const session of data.logged_sessions) {
      await tx.objectStore('logged_sessions').put(session);
    }
    for (const exercise of data.exercises) {
      await tx.objectStore('exercises').put(exercise);
    }
    for (const muscle of data.muscles) {
      await tx.objectStore('muscles').put(muscle);
    }

    await tx.done;

    if (data.seed_version === SEED_VERSION) {
      this.rememberSeedVersion();
      return;
    }

    const seed = await this.fetchExerciseSeed();
    if (!seed) {
      /**
       * The imported catalog does not match this build, and the new seed did not load.
       * Clear the stored version so the next launch tries the reseed. Leaving the current
       * version in place would keep the outdated exercises.
       */
      localStorage.removeItem(SEED_VERSION_STORAGE_KEY);
      console.error('Exercise seed is unavailable, so the imported catalog was kept.');
      return;
    }

    await this.writeExerciseSeed(db, seed);
  }

  async clearAllData(): Promise<void> {
    try {
      const db = await this.dbPromise;
      const tx = db.transaction(
        ['workout_plans', 'logged_sessions', 'exercises', 'muscles'],
        'readwrite',
      );
      await tx.objectStore('workout_plans').clear();
      await tx.objectStore('logged_sessions').clear();
      await tx.objectStore('exercises').clear();
      await tx.objectStore('muscles').clear();
      await tx.done;

      await this.populateInitialData(db);
    } catch (error) {
      console.error('Error clearing database data:', error);
      throw error;
    }
  }
}
