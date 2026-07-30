import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';
import { WorkoutPlan, LoggedSession, Exercise, Muscle } from '@/shared/models';
import { mockMuscles, mockExercises, mockLoggedSessions, mockWorkoutPlans } from '../mocks';

@Injectable({
  providedIn: 'root',
})
/**
 * Service to manage IndexedDB operations for workout plans, logged sessions, exercises, and muscles.
 * @example
 * const dbService = inject(DbService);
 * const plans = await dbService.getWorkoutPlans();
 */
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
        // Workout Plans
        if (!db.objectStoreNames.contains('workout_plans')) {
          const plansStore = db.createObjectStore('workout_plans', { keyPath: 'id' });
          plansStore.createIndex('isDefault', 'isDefault');
        }

        // Logged Sessions
        if (!db.objectStoreNames.contains('logged_sessions')) {
          const sessionsStore = db.createObjectStore('logged_sessions', { keyPath: 'id' });
          sessionsStore.createIndex('start_time', 'start_time');
        }

        // Exercises
        if (!db.objectStoreNames.contains('exercises')) {
          const exercisesStore = db.createObjectStore('exercises', { keyPath: 'id' });
        }

        // Muscles
        if (!db.objectStoreNames.contains('muscles')) {
          db.createObjectStore('muscles', { keyPath: 'id' });
        }
      },
    });

    // Populate Initial Data if needed
    await this.populateInitialData(db);

    return db;
  }

  private async populateInitialData(db: IDBPDatabase<any>) {
    // Logged Sessions
    const loggedSessionCount = await db.count('logged_sessions');
    if (loggedSessionCount === 0) {
      const tx = db.transaction('logged_sessions', 'readwrite');
      for (const loggedSession of mockLoggedSessions) {
        tx.store.put(loggedSession);
      }
      await tx.done;
    }

    // Populate Muscles
    const muscleCount = await db.count('muscles');
    if (muscleCount === 0) {
      const tx = db.transaction('muscles', 'readwrite');
      for (const muscle of mockMuscles) {
        tx.store.put(muscle);
      }
      await tx.done;
    }

    // Populate Exercises
    const exerciseCount = await db.count('exercises');
    if (exerciseCount === 0) {
      const tx = db.transaction('exercises', 'readwrite');
      for (const exercise of mockExercises) {
        tx.store.put(exercise);
      }
      await tx.done;
    }

    // Populate Workout Plans
    const plansCount = await db.count('workout_plans');
    if (plansCount === 0) {
      const tx = db.transaction('workout_plans', 'readwrite');
      for (const plan of mockWorkoutPlans) {
        tx.store.put(plan);
      }
      await tx.done;
    }
  }

  // --- CRUD for Workout Plans ---
  /**
   * Retrieves all workout plans from the database.
   * @returns {Promise<WorkoutPlan[]>} A promise resolving to an array of workout plans.
   * @example
   * const plans = await this.dbService.getWorkoutPlans();
   */
  async getWorkoutPlans(): Promise<WorkoutPlan[]> {
    const db = await this.dbPromise;
    return db.getAll('workout_plans');
  }

  /**
   * Retrieves a specific workout plan by its ID.
   * @param {number} id The ID of the workout plan.
   * @returns {Promise<WorkoutPlan | undefined>} A promise resolving to the workout plan, or undefined if not found.
   * @example
   * const plan = await this.dbService.getWorkoutPlan(1);
   */
  async getWorkoutPlan(id: number): Promise<WorkoutPlan | undefined> {
    const db = await this.dbPromise;
    return db.get('workout_plans', id);
  }

  /**
   * Saves or updates a workout plan in the database.
   * @param {WorkoutPlan} plan The workout plan to save.
   * @returns {Promise<number>} A promise resolving to the ID of the saved plan.
   * @example
   * const id = await this.dbService.saveWorkoutPlan(newPlan);
   */
  async saveWorkoutPlan(plan: WorkoutPlan): Promise<number> {
    const db = await this.dbPromise;
    const now = new Date().toISOString();
    if (!plan.createdAt) plan.createdAt = now;
    plan.updatedAt = now;
    return db.put('workout_plans', plan);
  }

  /**
   * Deletes a workout plan by its ID.
   * @param {number} id The ID of the workout plan to delete.
   * @returns {Promise<void>} A promise resolving when the deletion is complete.
   * @example
   * await this.dbService.deleteWorkoutPlan(1);
   */
  async deleteWorkoutPlan(id: number): Promise<void> {
    const db = await this.dbPromise;
    return db.delete('workout_plans', id);
  }

  // --- CRUD for Logged Sessions ---
  /**
   * Retrieves all logged sessions from the database, sorted by start time descending.
   * @returns {Promise<LoggedSession[]>} A promise resolving to an array of logged sessions.
   * @example
   * const sessions = await this.dbService.getLoggedSessions();
   */
  async getLoggedSessions(): Promise<LoggedSession[]> {
    const db = await this.dbPromise;
    // Get all sessions and sort by start time descending
    const sessions = await db.getAllFromIndex('logged_sessions', 'start_time');
    return sessions.reverse();
  }

  /**
   * Retrieves a specific logged session by its ID.
   * @param {number} id The ID of the logged session.
   * @returns {Promise<LoggedSession | undefined>} A promise resolving to the logged session, or undefined if not found.
   * @example
   * const session = await this.dbService.getLoggedSession(1);
   */
  async getLoggedSession(id: number): Promise<LoggedSession | undefined> {
    const db = await this.dbPromise;
    return db.get('logged_sessions', id);
  }

  /**
   * Saves or updates a logged session in the database.
   * @param {LoggedSession} session The logged session to save.
   * @returns {Promise<number>} A promise resolving to the ID of the saved session.
   * @example
   * const id = await this.dbService.saveLoggedSession(newSession);
   */
  async saveLoggedSession(session: LoggedSession): Promise<number> {
    const db = await this.dbPromise;
    const now = new Date().toISOString();
    if (!session.createdAt) session.createdAt = now;
    session.updatedAt = now;
    return db.put('logged_sessions', session);
  }

  // --- CRUD for Exercises ---
  /**
   * Retrieves all exercises from the database.
   * @returns {Promise<Exercise[]>} A promise resolving to an array of exercises.
   * @example
   * const exercises = await this.dbService.getExercises();
   */
  async getExercises(): Promise<Exercise[]> {
    const db = await this.dbPromise;
    return db.getAll('exercises');
  }

  /**
   * Retrieves a specific exercise by its key/ID.
   * @param {any} key The key/ID of the exercise.
   * @returns {Promise<Exercise | undefined>} A promise resolving to the exercise, or undefined if not found.
   * @example
   * const exercise = await this.dbService.getExerciseByKey(1);
   */
  async getExerciseByKey(key: any): Promise<Exercise | undefined> {
    if (key === undefined || key === null) return undefined;
    const db = await this.dbPromise;
    return db.get('exercises', key);
  }

  /**
   * Saves or updates an exercise in the database.
   * @param {Exercise} exercise The exercise to save.
   * @returns {Promise<number>} A promise resolving to the ID of the saved exercise.
   * @example
   * const id = await this.dbService.saveExercise(newExercise);
   */
  async saveExercise(exercise: Exercise): Promise<number> {
    const db = await this.dbPromise;
    const now = new Date().toISOString();
    if (!exercise.createdAt) exercise.createdAt = now;
    exercise.updatedAt = now;
    return db.put('exercises', exercise);
  }

  // --- CRUD for Muscles ---
  /**
   * Retrieves all muscles from the database.
   * @returns {Promise<Muscle[]>} A promise resolving to an array of muscles.
   * @example
   * const muscles = await this.dbService.getMuscles();
   */
  async getMuscles(): Promise<Muscle[]> {
    const db = await this.dbPromise;
    return db.getAll('muscles');
  }

  // --- Export / Import Backup ---
  /**
   * Consolidates and exports all database stores as a single JSON-serializable object.
   */
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

  /**
   * Overwrites the database stores with the provided backup data.
   */
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

  /**
   * Clears all data from all object stores and re-seeds with the initial default data.
   */
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
