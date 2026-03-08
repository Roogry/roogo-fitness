import { Injectable, computed, signal, inject } from '@angular/core';
import { Exercise, Muscle, TrackedExercise, WorkoutSet, LoggedWorkoutSession } from '../types/workout.types';
import { mockMuscles, mockExercises, mockLoggedWorkoutSessions } from '../mocks/workout.mock';
import { DbService } from './db.service';

export * from '../types/workout.types';

@Injectable({
  providedIn: 'root',
})
export class WorkoutService {
  // Services
  private dbService = inject(DbService);

  // Mock API Data
  private mockMuscles = mockMuscles;
  private mockExercises = [...mockExercises];
  private mockLoggedWorkoutSessions = mockLoggedWorkoutSessions;

  // State
  activeExercises = signal<TrackedExercise[]>([]);
  sessionStartTime = signal<number | null>(null);
  sessionDuration = signal<number>(0);
  private durationInterval: any;

  // Computed state for UI convenience
  hasActiveWorkout = computed(() => this.activeExercises().length > 0);
  
  totalVolume = computed(() => {
    return this.activeExercises().reduce((acc, tracked) => {
      const exerciseVolume = tracked.sets.reduce((setAcc, set) => setAcc + (set.weight_lifted * set.reps_completed), 0);
      return acc + exerciseVolume;
    }, 0);
  });

  totalSets = computed(() => {
    return this.activeExercises().reduce((acc, tracked) => acc + tracked.sets.length, 0);
  });

  constructor() {
    // DbService handles init
  }

  startSessionTimer() {
    if (this.sessionStartTime()) return;
    
    this.sessionStartTime.set(Date.now());
    this.durationInterval = setInterval(() => {
      if (this.sessionStartTime()) {
         // duration in seconds
        this.sessionDuration.set(Math.floor((Date.now() - this.sessionStartTime()!) / 1000));
      }
    }, 1000);
  }

  stopSessionTimer() {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = undefined;
    }
  }

  formatDuration(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}min ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}min ${secs}s`;
    }
    return `${secs}s`;
  }

  // --- Mock API Methods ---
  async searchExercises(query: string): Promise<Exercise[]> {
    // Simulate network delay for realism
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!query.trim()) return this.mockExercises;

    const lowerQuery = query.toLowerCase();
    return this.mockExercises.filter((e) => e.name.toLowerCase().includes(lowerQuery));
  }

  async getMuscles(): Promise<Muscle[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.mockMuscles;
  }

  async getLoggedWorkoutSessions(): Promise<LoggedWorkoutSession[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    // Simulate real fetching by ordering decending by start_time
    return [...this.mockLoggedWorkoutSessions].sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  }

  // --- State Mutations ---
  async getExerciseById(id: number): Promise<Exercise | undefined> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.mockExercises.find((e) => e.id === id);
  }

  addCustomExercise(name: string): Exercise {
    const newExercise: Exercise = {
      id: Date.now(),
      name,
      media: [],
    };
    this.mockExercises.push(newExercise);
    return newExercise;
  }

  updateExercise(id: number, updates: Partial<Exercise>) {
    // Update in mock db
    const mockIdx = this.mockExercises.findIndex((e) => e.id === id);
    if (mockIdx !== -1) {
      this.mockExercises[mockIdx] = { ...this.mockExercises[mockIdx], ...updates };
    }

    // Update in active tracked exercises
    this.activeExercises.update((current) => {
      return current.map((te) => {
        if (te.exercise.id === id) {
          return { ...te, exercise: { ...te.exercise, ...updates } };
        }
        return te;
      });
    });
  }

  addTrackedExercise(exercise: Exercise) {
    this.startSessionTimer(); // Ensure timer runs if not already
    this.activeExercises.update((current) => {
      // Prevent duplicates in active list
      if (current.find((te) => te.exercise.id === exercise.id)) {
        return current;
      }
      return [...current, { exercise, sets: [] }];
    });
  }

  removeTrackedExercise(exerciseId: number) {
    this.activeExercises.update((current) => current.filter((te) => te.exercise.id !== exerciseId));
  }

  addSet(exerciseId: number, weight: number, reps: number) {
    this.activeExercises.update((current) => {
      const index = current.findIndex((te) => te.exercise.id === exerciseId);
      if (index === -1) return current;

      const updatedExercises = [...current];
      const tracked = { ...updatedExercises[index] };
      const newSetNumber = tracked.sets.length + 1;

      tracked.sets = [
        ...tracked.sets,
        {
          id: crypto.randomUUID(),
          exercise_id: exerciseId,
          set_number: newSetNumber,
          weight_lifted: weight,
          reps_completed: reps,
        },
      ];

      updatedExercises[index] = tracked;
      return updatedExercises;
    });
  }

  updateSet(exerciseId: number, setId: string, updates: Partial<WorkoutSet>) {
    this.activeExercises.update((current) => {
      const index = current.findIndex((te) => te.exercise.id === exerciseId);
      if (index === -1) return current;

      const updatedExercises = [...current];
      const tracked = { ...updatedExercises[index] };

      tracked.sets = tracked.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s));

      updatedExercises[index] = tracked;
      return updatedExercises;
    });
  }

  removeSet(exerciseId: number, setId: string) {
    this.activeExercises.update((current) => {
      const index = current.findIndex((te) => te.exercise.id === exerciseId);
      if (index === -1) return current;

      const updatedExercises = [...current];
      const tracked = { ...updatedExercises[index] };

      tracked.sets = tracked.sets
        .filter((s) => s.id !== setId)
        .map((s, idx) => ({
          ...s,
          set_number: idx + 1, // Re-number sets
        }));

      updatedExercises[index] = tracked;
      return updatedExercises;
    });
  }

  // --- Syncing & Offline Storage ---
  async finishWorkout() {
    const workoutData = this.activeExercises();
    if (workoutData.length === 0) return;

    const session: LoggedWorkoutSession = {
      id: Date.now(),
      user_id: 'local_user', 
      session_title: 'Unplanned Session', 
      start_time: new Date(this.sessionStartTime() || Date.now()).toISOString(),
      end_time: new Date().toISOString(),
      total_duration: this.sessionDuration(),
      total_weight_lifted: this.totalVolume(),
      notes: 'Logged via local storage app',
      workouts: workoutData.map(te => ({
        id: Date.now() + Math.floor(Math.random() * 1000), 
        exercise_id: te.exercise.id,
        exercise: te.exercise,
        workout_title: te.exercise.name,
        sets: te.sets.map(s => ({
          id: Date.now() + Math.floor(Math.random() * 10000),
          logged_workout_id: 0, 
          exercise_id: te.exercise.id,
          set_number: s.set_number,
          is_warmup: false, 
          reps_completed: s.reps_completed,
          weight_lifted: s.weight_lifted,
          completed_at: new Date().toISOString()
        }))
      }))
    };

    console.group('Saving Session to DB');
    console.log('Session:', session);

    try {
      await this.dbService.saveLoggedSession(session);
      console.log('Session successfully saved to IndexedDB!');
      this.clearSession();
    } catch (error) {
      console.error('Failed to save session to DB', error);
      this.clearSession();
    }
    console.groupEnd();
  }

  private clearSession() {
    this.stopSessionTimer();
    this.sessionStartTime.set(null);
    this.sessionDuration.set(0);
    this.activeExercises.set([]);
  }
}
