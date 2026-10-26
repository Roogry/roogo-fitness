import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';
import { WorkoutPlan, LoggedSession, Exercise, Muscle } from '@/shared/models';
import { mockMuscles, mockExercises, mockWorkoutPlans } from '../mocks';
import {
  RESEED_STORE_NAMES,
  SEED_VERSION,
  SEED_VERSION_STORAGE_KEY,
} from '../utils/seed.constants';
import { shouldReseed } from '../utils/seed.utils';

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
    this.rememberSeedVersion();

    return db;
  }

  /**
   * A store is filled only when it is empty, so an old install would keep the first seed forever.
   * When the seed version changes, the exercise and muscle rows are replaced.
   * Logged sessions and workout plans stay: sessions copy each exercise, and plans point at stable seed ids.
   */
  private async applySeedVersion(db: IDBPDatabase<any>): Promise<void> {
    const storedVersion = localStorage.getItem(SEED_VERSION_STORAGE_KEY);
    if (!shouldReseed(storedVersion, SEED_VERSION)) return;

    const tx = db.transaction([...RESEED_STORE_NAMES], 'readwrite');
    for (const storeName of RESEED_STORE_NAMES) {
      await tx.objectStore(storeName).clear();
    }
    await tx.done;
  }

  /** Written only after a seed succeeds, so a failed write is retried on the next launch. */
  private rememberSeedVersion(): void {
    localStorage.setItem(SEED_VERSION_STORAGE_KEY, String(SEED_VERSION));
  }

  private async populateInitialData(db: IDBPDatabase<any>) {
    const muscleCount = await db.count('muscles');
    if (muscleCount === 0) {
      const tx = db.transaction('muscles', 'readwrite');
      for (const muscle of mockMuscles) {
        tx.store.put(muscle);
      }
      await tx.done;
    }

    const exerciseCount = await db.count('exercises');
    if (exerciseCount === 0) {
      const tx = db.transaction('exercises', 'readwrite');
      for (const exercise of mockExercises) {
        tx.store.put(exercise);
      }
      await tx.done;
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

  async exportBackup(): Promise<any> {
    const db = await this.dbPromise;
    const workout_plans = await db.getAll('workout_plans');
    const logged_sessions = await db.getAll('logged_sessions');
    const exercises = await db.getAll('exercises');
    const muscles = await db.getAll('muscles');

    return {
      version: 1,
      workout_plans,
      logged_sessions,
      exercises,
      muscles,
    };
  }

  async importBackup(data: any): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(
      ['workout_plans', 'logged_sessions', 'exercises', 'muscles'],
      'readwrite',
    );

    await tx.objectStore('workout_plans').clear();
    await tx.objectStore('logged_sessions').clear();
    await tx.objectStore('exercises').clear();
    await tx.objectStore('muscles').clear();

    if (Array.isArray(data.workout_plans)) {
      for (const plan of data.workout_plans) {
        await tx.objectStore('workout_plans').put(plan);
      }
    }
    if (Array.isArray(data.logged_sessions)) {
      for (const session of data.logged_sessions) {
        await tx.objectStore('logged_sessions').put(session);
      }
    }
    if (Array.isArray(data.exercises)) {
      for (const exercise of data.exercises) {
        await tx.objectStore('exercises').put(exercise);
      }
    }
    if (Array.isArray(data.muscles)) {
      for (const muscle of data.muscles) {
        await tx.objectStore('muscles').put(muscle);
      }
    }

    await tx.done;
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
      this.rememberSeedVersion();
    } catch (error) {
      console.error('Error clearing database data:', error);
      throw error;
    }
  }
}
