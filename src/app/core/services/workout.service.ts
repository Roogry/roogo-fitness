import { Injectable, computed, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { ZardDialogService } from '@/shared/components/zard/dialog';
import { DbService } from './db.service';
import { Exercise, LoggedSession, LoggedExercise, LoggedSet } from '@/shared/models';

const ACTIVE_SESSION_STORAGE_KEY = 'roogo_active_session';

@Injectable({
  providedIn: 'root',
})
/**
 * Service to track active workout sessions and save completed logs.
 * @example
 * const workoutService = inject(WorkoutService);
 * workoutService.startSessionFlow(planId, sessionId);
 */
export class WorkoutService {
  private dbService = inject(DbService);
  private router = inject(Router);
  private dialogService = inject(ZardDialogService);

  selectedPlanId = signal<number | null>(null);
  selectedSessionId = signal<number | null>(null);
  sessionTitle = signal<string>('');
  trackedExercises = signal<LoggedExercise[]>([]);
  sessionStartTime = signal<number | null>(null);
  sessionDuration = signal<number>(0);

  private durationInterval: any;
  private isRestoring = false;

  constructor() {
    effect((onCleanup) => {
      this.selectedPlanId();
      this.selectedSessionId();
      this.sessionTitle();
      this.trackedExercises();
      this.sessionStartTime();

      const timeoutId = setTimeout(() => {
        this.saveStateToLocalStorage();
      }, 500);

      onCleanup(() => clearTimeout(timeoutId));
    });

    this.loadStateFromLocalStorage();
  }

  // Computed state for UI convenience
  hasExercise = computed(() => this.trackedExercises().length > 0);

  totalVolume = computed(() => {
    return this.trackedExercises().reduce((acc, exercise) => {
      const exerciseVolume = exercise.sets.reduce(
        (setAcc, set) => setAcc + (set.weight_lifted ?? 0) * (set.reps_completed ?? 0),
        0,
      );
      return acc + exerciseVolume;
    }, 0);
  });

  totalSets = computed(() => {
    return this.trackedExercises().reduce((acc, exercise) => acc + exercise.sets.length, 0);
  });

  totalExercises = computed(() => {
    return this.trackedExercises().length;
  });

  completedSets = computed(() => {
    return this.trackedExercises().reduce((acc, exercise) => {
      const finished = exercise.sets.filter(
        (set) => (set.reps_completed ?? 0) > 0 && (set.weight_lifted ?? 0) > 0,
      ).length;
      return acc + finished;
    }, 0);
  });

  completedExercises = computed(() => {
    return this.trackedExercises().filter((exercise) => {
      if (exercise.sets.length === 0) return false;
      return exercise.sets.every(
        (set) => (set.reps_completed ?? 0) > 0 && (set.weight_lifted ?? 0) > 0,
      );
    }).length;
  });

  private saveStateToLocalStorage() {
    if (this.isRestoring) return;

    const stateToSave = {
      selectedPlanId: this.selectedPlanId(),
      selectedSessionId: this.selectedSessionId(),
      sessionTitle: this.sessionTitle(),
      trackedExercises: this.trackedExercises(),
      sessionStartTime: this.sessionStartTime(),
      sessionDuration: this.sessionDuration(),
    };

    localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
  }

  private loadStateFromLocalStorage() {
    const savedData = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
    if (savedData) {
      try {
        this.isRestoring = true;
        const parsed = JSON.parse(savedData);

        this.selectedPlanId.set(parsed.selectedPlanId ?? null);
        this.selectedSessionId.set(parsed.selectedSessionId ?? null);
        this.sessionTitle.set(parsed.sessionTitle ?? '');
        this.trackedExercises.set(parsed.trackedExercises ?? []);

        if (parsed.sessionStartTime) {
          this.sessionStartTime.set(parsed.sessionStartTime);
          this.sessionDuration.set(parsed.sessionDuration ?? 0);

          this.startSessionTimer();
        }
      } catch (error) {
        console.error('Gagal me-restore session dari local storage', error);
      } finally {
        this.isRestoring = false;
      }
    }
  }

  /**
   * Retrieves an exercise by its ID.
   * @param {number} id The ID of the exercise.
   * @returns {Promise<Exercise | undefined>} A promise resolving to the exercise.
   * @example
   * const exercise = await this.workoutService.getExerciseById(1);
   */
  async getExerciseById(id: number) {
    return this.dbService.getExerciseByKey(id);
  }

  /**
   * Sets up an active session state based on a saved plan.
   * @param {number} planId The ID of the plan.
   * @param {number} sessionId The ID of the session.
   * @returns {Promise<void>}
   * @example
   * await this.workoutService.setupSessionFromPlan(1, 2);
   */
  async setupSessionFromPlan(planId: number, sessionId: number) {
    const plan = await this.dbService.getWorkoutPlan(planId);
    if (!plan) throw new Error('Plan not found');

    const session = plan.sessions.find((s) => s.id === sessionId);
    if (!session) throw new Error('Session not found in plan');

    this.sessionTitle.set(session.title);
    this.selectedPlanId.set(plan.id);
    this.selectedSessionId.set(sessionId);

    if (session.exercises) {
      const activeExercises: LoggedExercise[] = [];
      for (const pe of session.exercises) {
        const exercise = await this.getExerciseById(pe.exercise_id);
        if (!exercise) continue;

        const sets: LoggedSet[] = Array.from({ length: pe.target_sets || 0 }).map((_, i) => ({
          id: Date.now() + Math.floor(Math.random() * 10000) + i,
          set_number: i + 1,
          reps_completed: undefined,
          weight_lifted: undefined,
          target_reps: pe.target_reps,
          target_weight: pe.target_weight,
        }));

        activeExercises.push({
          id: Date.now() + Math.floor(Math.random() * 1000) + pe.id,
          exercise: exercise,
          sets: sets,
        });
      }
      this.trackedExercises.set(activeExercises);
    }
  }

  /**
   * Completes the active session and saves it to the database.
   * @param {string} [title] Optional final title for the session.
   * @param {string} [notes] Optional notes for the session.
   * @returns {Promise<void>}
   * @example
   * await this.workoutService.finishSession('Leg Day', 'Felt strong today.');
   */
  async finishSession(title?: string, notes?: string) {
    if (this.trackedExercises().length === 0) return;

    if (title !== undefined) {
      this.sessionTitle.set(title);
    }

    const session: LoggedSession = {
      id: Date.now(),
      user_id: Date.now() + Math.floor(Math.random() * 1000),
      workout_plan_session_id: this.selectedSessionId(),
      session_title: title || this.sessionTitle() || 'Unplanned Session',
      start_time: new Date(this.sessionStartTime() || Date.now()).toISOString(),
      end_time: new Date().toISOString(),
      total_duration: this.sessionDuration(),
      total_weight_lifted: this.totalVolume(),
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workouts: this.trackedExercises().map((te) => ({
        id: Date.now() + Math.floor(Math.random() * 1000),
        exercise_id: te.exercise.id,
        exercise: te.exercise,
        workout_title: te.exercise.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sets: te.sets.map((ts) => ({
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
        })),
      })),
    };

    try {
      await this.dbService.saveLoggedSession(session);
      this.clearSession();
    } catch (error) {
      throw new Error('Failed to save session to DB');
    } finally {
      this.clearSession();
      console.groupEnd();
    }
  }

  /**
   * Starts the active session duration timer.
   * @returns {void}
   * @example
   * this.workoutService.startSessionTimer();
   */
  startSessionTimer() {
    if (this.durationInterval) return;

    if (!this.sessionStartTime()) {
      this.sessionStartTime.set(Date.now());
    }
    this.durationInterval = setInterval(() => {
      if (this.sessionStartTime()) {
        this.sessionDuration.set(Math.floor((Date.now() - this.sessionStartTime()!) / 1000));
      }
    }, 1000);
  }

  /**
   * Stops the active session duration timer.
   * @returns {void}
   * @example
   * this.workoutService.stopSessionTimer();
   */
  stopSessionTimer() {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = undefined;
    }
  }

  /**
   * Retrieves all completed workout sessions.
   * @returns {Promise<LoggedSession[]>} A promise resolving to the logged sessions.
   * @example
   * const sessions = await this.workoutService.getLoggedWorkoutSessions();
   */
  async getLoggedWorkoutSessions(): Promise<LoggedSession[]> {
    // Simulate real fetching by ordering decending by start_time
    const loggedSessions = await this.dbService.getLoggedSessions();
    return loggedSessions.sort(
      (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
    );
  }

  /**
   * Adds an exercise to the active tracked session.
   * @param {Exercise} exercise The exercise to track.
   * @returns {void}
   * @example
   * this.workoutService.addTrackedExercise(exercise);
   */
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
      };
      return [...(current || []), newTrackedExercise];
    });
  }

  /**
   * Removes an exercise from the active tracked session.
   * @param {number} exerciseId The ID of the exercise.
   * @returns {void}
   * @example
   * this.workoutService.removeTrackedExercise(1);
   */
  removeTrackedExercise(exerciseId: number) {
    this.trackedExercises.update((current) =>
      current.filter((te) => te.exercise.id !== exerciseId),
    );
  }

  /**
   * Adds a new logged set to a tracked exercise.
   * @param {number} exerciseId The ID of the exercise.
   * @param {number} weight The weight lifted in the set.
   * @param {number} reps The repetitions completed.
   * @returns {void}
   * @example
   * this.workoutService.addSet(1, 60, 10);
   */
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

  /**
   * Updates an existing logged set for a tracked exercise.
   * @param {number} exerciseId The ID of the exercise.
   * @param {number} setId The ID of the set.
   * @param {Partial<LoggedSet>} updates The properties to update.
   * @returns {void}
   * @example
   * this.workoutService.updateSet(1, 2, { reps_completed: 12 });
   */
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

  /**
   * Removes a logged set from a tracked exercise.
   * @param {number} exerciseId The ID of the exercise.
   * @param {number} setId The ID of the set to remove.
   * @returns {void}
   * @example
   * this.workoutService.removeSet(1, 2);
   */
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

  /**
   * Stops the active session without clearing stored data entirely.
   * @returns {void}
   * @example
   * this.workoutService.stopSession();
   */
  stopSession() {
    this.stopSessionTimer();
    this.trackedExercises.set([]);
    this.sessionStartTime.set(null);
    this.sessionDuration.set(0);
  }

  /**
   * Clears the active session and removes it from local storage.
   * @returns {void}
   * @example
   * this.workoutService.clearSession();
   */
  clearSession() {
    this.stopSession();
    this.selectedPlanId.set(null);
    this.selectedSessionId.set(null);
    this.sessionTitle.set('');
    localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
  }

  /**
   * Initiates the active session flow, prompting the user if one is already active.
   * @param {number | null} planId The plan ID (if starting from a plan).
   * @param {number | null} sessionId The session ID (if starting from a plan).
   * @returns {void}
   * @example
   * this.workoutService.startSessionFlow(1, 2);
   */
  startSessionFlow(planId: number | null, sessionId: number | null) {
    if (this.sessionStartTime()) {
      this.dialogService.create({
        zWidth: '400px',
        zTitle: 'Active Workout Session',
        zDescription:
          'You already have an active workout session running. Are you sure you want to start a new workout?',
        zOkText: 'Start New',
        zOkDestructive: true,
        zCancelText: 'Cancel',
        zOnOk: () => {
          this.clearSession();
          this.router.navigate(['/session/active'], {
            queryParams: { planId, sessionId, autoStart: 'true' },
          });
        },
      });
    } else {
      this.router.navigate(['/session/active'], {
        queryParams: { planId, sessionId, autoStart: 'true' },
      });
    }
  }

  /**
   * Updates target values of specific exercises in the workout plan.
   * @param {number} planId The ID of the plan.
   * @param {number} sessionId The ID of the session.
   * @param {Array<{ exerciseId: number; targetWeight?: number; targetReps?: number; }>} updates The updates to apply.
   * @returns {Promise<void>}
   */
  async updatePlanTargets(
    planId: number,
    sessionId: number,
    updates: { exerciseId: number; targetWeight?: number; targetReps?: number }[],
  ) {
    const plan = await this.dbService.getWorkoutPlan(planId);
    if (!plan) return;

    const session = plan.sessions.find((s) => s.id === sessionId);
    if (!session || !session.exercises) return;

    for (const update of updates) {
      const exercise = session.exercises.find((e) => e.exercise_id === update.exerciseId);
      if (exercise) {
        if (update.targetWeight !== undefined) {
          exercise.target_weight = update.targetWeight;
        }
        if (update.targetReps !== undefined) {
          exercise.target_reps = update.targetReps;
        }
        exercise.updatedAt = new Date().toISOString();
      }
    }

    await this.dbService.saveWorkoutPlan(plan);
  }
}
