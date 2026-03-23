import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';
import { WorkoutPlan, LoggedSession, Exercise, Muscle, WorkoutPlanSession } from '../types/workout.types';
import { mockMuscles, mockExercises, mockLoggedSessions, mockWorkoutPlans } from '../mocks/workout.mock';

@Injectable({
  providedIn: 'root'
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
      console.log(`Persistent storage granted: ${isPersisted}`);
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
      }
    });

    // Populate Initial Data if needed
    await this.populateInitialData(db);

    return db;
  }

  private async populateInitialData(db: IDBPDatabase<any>) {
    // Logged Sessions
    const loggedSessionCount = await db.count('logged_sessions');
    if (loggedSessionCount === 0) {
      console.log('Populating initial logged sessions data...');
      const tx = db.transaction('logged_sessions', 'readwrite');
      for (const loggedSession of mockLoggedSessions) {
        tx.store.put(loggedSession);
      }
      await tx.done;
    }

    // Populate Muscles
    const muscleCount = await db.count('muscles');
    if (muscleCount === 0) {
      console.log('Populating initial muscles data...');
      const tx = db.transaction('muscles', 'readwrite');
      for (const muscle of mockMuscles) {
        tx.store.put(muscle);
      }
      await tx.done;
    }

    // Populate Exercises
    const exerciseCount = await db.count('exercises');
    if (exerciseCount === 0) {
      console.log('Populating initial exercises data...');
      const tx = db.transaction('exercises', 'readwrite');
      for (const exercise of mockExercises) {
        tx.store.put(exercise);
      }
      await tx.done;
    }

    // Populate Workout Plans
    const plansCount = await db.count('workout_plans');
    if (plansCount === 0) {
      console.log('Populating initial workout plans...');
      const tx = db.transaction('workout_plans', 'readwrite');
      for (const plan of mockWorkoutPlans) {
        tx.store.put(plan);
      }
      await tx.done;
    }
  }

  // --- CRUD for Workout Plans ---
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

  // --- CRUD for Logged Sessions ---
  async getLoggedSessions(): Promise<LoggedSession[]> {
    const db = await this.dbPromise;
    // Get all sessions and sort by start time descending
    const sessions = await db.getAllFromIndex('logged_sessions', 'start_time');
    return sessions.reverse();
  }

  async getLoggedSession(id: number): Promise<LoggedSession | undefined> {
    const db = await this.dbPromise;
    return db.get('logged_sessions', id);
  }

  async saveLoggedSession(session: LoggedSession): Promise<number> {
    const db = await this.dbPromise;
    const now = new Date().toISOString();
    if (!session.createdAt) session.createdAt = now;
    session.updatedAt = now;
    return db.put('logged_sessions', session);
  }

  // --- CRUD for Exercises ---
  async getExercises(): Promise<Exercise[]> {
    const db = await this.dbPromise;
    return db.getAll('exercises');
  }

  async getExerciseByKey(key: any): Promise<Exercise> {
    const db = await this.dbPromise;
    return db.getKey('exercises', key);
  }

  async saveExercise(exercise: Exercise): Promise<number> {
    const db = await this.dbPromise;
    const now = new Date().toISOString();
    if (!exercise.createdAt) exercise.createdAt = now;
    exercise.updatedAt = now;
    return db.put('exercises', exercise);
  }

  // --- CRUD for Muscles ---
  async getMuscles(): Promise<Muscle[]> {
    const db = await this.dbPromise;
    return db.getAll('muscles');
  }
}
