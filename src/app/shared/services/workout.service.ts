import { Injectable, computed, inject, signal } from '@angular/core';
import { DbService } from './db.service';
import { Exercise, LoggedSession, LoggedExercise, WorkoutPlanSession, LoggedSet } from '../types/workout.types';

@Injectable({
  providedIn: 'root',
})
export class WorkoutService {
  // Services
  private dbService = inject(DbService);
  selectedPlanId = signal<number | null>(null);
  sessionTitle = signal<string>('');
  trackedExercises = signal<LoggedExercise[]>([]);
  sessionStartTime = signal<number | null>(null);
  sessionDuration = signal<number>(0);
  private durationInterval: any;

  // Computed state for UI convenience
  hasExercise = computed(() => this.trackedExercises().length > 0);
  
  totalVolume = computed(() => {
    return this.trackedExercises().reduce((acc, exercise) => {
      const exerciseVolume = exercise.sets.reduce((setAcc, set) => setAcc + ((set.weight_lifted?? 0) * (set.reps_completed?? 0)), 0);
      return acc + exerciseVolume;
    }, 0);
  });

  totalSets = computed(() => {
    return this.trackedExercises().reduce((acc, exercise) => acc + exercise.sets.length, 0);
  });

  async getExerciseById(id: number) {
    return this.dbService.getExerciseByKey(id);
  }

  async createSession() {
    if (this.trackedExercises().length === 0) return;

    const planSession: WorkoutPlanSession = {
      id: Date.now(),
      title: this.sessionTitle() || 'New Template Session',
      session_order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      exercises: this.trackedExercises().map((te, index) => ({
        id: Date.now() + Math.floor(Math.random() * 1000),
        exercise_order: index,
        target_sets: te.sets.length,
        target_reps: te.sets[0]?.reps_completed || 0,
        exercise: te.exercise,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
    };
    
    const plan = await this.dbService.getWorkoutPlan(this.selectedPlanId()!);
    if (!plan) throw new Error('The plan is not found');

    if (plan) {
        planSession.session_order = plan.sessions.length;
        plan.sessions = [...(plan.sessions || []), planSession];
        await this.dbService.saveWorkoutPlan(plan);
        console.log('Template session successfully saved to plan!');
    }
    this.clearSession();
  }

  async setSessionFromBlueprint(planId: number, sessionId: number) {
    const plan = await this.dbService.getWorkoutPlan(planId);
    if (!plan) throw new Error('Plan not found');

    const session = plan.sessions.find(s => s.id === sessionId);
    if (!session) throw new Error('Session not found in plan');

    this.sessionTitle.set(session.title);
    this.selectedPlanId.set(plan.id);

    if (session.exercises) {
      const activeExercises: LoggedExercise[] = session.exercises.map(pe => {
        const sets: LoggedSet[] = Array.from({ length: pe.target_sets || 0 }).map((_, i) => ({
          id: Date.now() + Math.floor(Math.random() * 10000) + i,
          set_number: i + 1,
          reps_completed: pe.target_reps,
          weight_lifted: pe.target_weight,
        }));

        return {
          id: Date.now() + Math.floor(Math.random() * 1000) + pe.id,
          exercise: pe.exercise,
          sets: sets
        };
      });
      this.trackedExercises.set(activeExercises);
    }
  }

  async finishSession() {
    if (this.trackedExercises().length === 0) return;

    const session: LoggedSession = {
      id: Date.now(),
      user_id: Date.now() + Math.floor(Math.random() * 1000), 
      session_title: this.sessionTitle() || 'Unplanned Session', 
      start_time: new Date(this.sessionStartTime() || Date.now()).toISOString(),
      end_time: new Date().toISOString(),
      total_duration: this.sessionDuration(),
      total_weight_lifted: this.totalVolume(),
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workouts: this.trackedExercises().map(te => ({
        id: Date.now() + Math.floor(Math.random() * 1000), 
        exercise_id: te.exercise.id,
        exercise: te.exercise,
        workout_title: te.exercise.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sets: te.sets.map(ts => ({
          id: Date.now() + Math.floor(Math.random() * 10000),
          exercise_id: te.exercise.id,
          set_number: ts.set_number,
          reps_completed: ts.reps_completed,
          weight_lifted: ts.weight_lifted,
          rest_time_taken_sec: ts.rest_time_taken_sec,
          is_warmup: ts.is_warmup,
          completed_at: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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
      throw new Error('Failed to save session to DB');
    } finally {
      this.clearSession();
      console.groupEnd();
    }
  }

  startSessionTimer() {
    if (this.sessionStartTime()) return;
    
    this.sessionStartTime.set(Date.now());
    this.durationInterval = setInterval(() => {
      if (this.sessionStartTime()) {
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

  async getLoggedWorkoutSessions(): Promise<LoggedSession[]> {
    // Simulate real fetching by ordering decending by start_time
    const loggedSessions = await this.dbService.getLoggedSessions();
    return loggedSessions.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
  }

  addTrackedExercise(exercise: Exercise) {
    // Ensure timer runs if not already
    this.startSessionTimer(); 

    this.trackedExercises.update((current) => {
      // Prevent duplicates in active list
      if (current.find((te) => te.exercise.id === exercise.id)) {
        return current;
      }

      const newTrackedExercise: LoggedExercise = {
        id: Date.now(),
        exercise: exercise,
        sets: [],
      }
      return [...(current || []), newTrackedExercise];
    });
  }

  removeTrackedExercise(exerciseId: number) {
    this.trackedExercises.update((current) => current.filter((te) => te.exercise.id !== exerciseId));
  }

  addSet(exerciseId: number, weight: number, reps: number) {
    this.trackedExercises.update((current) => {
      const index = current.findIndex((te) => te.exercise.id === exerciseId);
      if (index === -1) return current;

      const updatedExercises = [...current];
      const tracked = { ...updatedExercises[index] };
      const newSetNumber = tracked.sets.length + 1;

      tracked.sets = [
        ...tracked.sets,
        {
          id: Date.now(),
          logged_exercise_id: exerciseId,
          set_number: newSetNumber,
          weight_lifted: weight,
          reps_completed: reps,
        },
      ];

      updatedExercises[index] = tracked;
      return updatedExercises;
    });
  }

  updateSet(exerciseId: number, setId: number, updates: Partial<LoggedSet>) {
    this.trackedExercises.update((current) => {
      const index = current.findIndex((te) => te.exercise.id === exerciseId);
      if (index === -1) return current;

      const updatedExercises = [...current];
      const tracked = { ...updatedExercises[index] };

      tracked.sets = tracked.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s));

      updatedExercises[index] = tracked;
      return updatedExercises;
    });
  }

  removeSet(exerciseId: number, setId: number) {
    this.trackedExercises.update((current) => {
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

  clearSession() {
    this.stopSessionTimer();
    this.selectedPlanId.set(null);
    this.sessionTitle.set('');
    this.trackedExercises.set([]);
    this.sessionStartTime.set(null);
    this.sessionDuration.set(0);
  }
}