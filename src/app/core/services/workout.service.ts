import { Injectable, computed, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { ZardDialogService } from '@/shared/components/zard/dialog';
import { DbService } from './db.service';
import { Exercise, LoggedSession, LoggedExercise, LoggedSet } from '@/shared/models';
import type { ReplacementTargets } from '@/core/utils/replace-tracked-exercise.types';
import {
  findSavedExerciseTargets,
  nextPlannedExercise,
  setsAfterExerciseReplace,
} from '@/core/utils/replace-tracked-exercise.utils';

import { ACTIVE_SESSION_STORAGE_KEY } from '@/core/utils/workout.constants';

@Injectable({
  providedIn: 'root',
})
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
  /**
   * Epoch milliseconds when the current rest countdown finishes.
   * Stored instead of "seconds left" so rest survives navigation and refresh,
   * the same way `sessionStartTime` keeps workout duration accurate.
   */
  restEndsAt = signal<number | null>(null);
  restRemainingSeconds = signal<number | null>(null);

  private durationInterval: any;
  private restInterval: ReturnType<typeof setInterval> | undefined;
  private isRestoring = false;

  constructor() {
    effect((onCleanup) => {
      this.selectedPlanId();
      this.selectedSessionId();
      this.sessionTitle();
      this.trackedExercises();
      this.sessionStartTime();
      this.restEndsAt();

      const timeoutId = setTimeout(() => {
        this.saveStateToLocalStorage();
      }, 500);

      onCleanup(() => clearTimeout(timeoutId));
    });

    this.loadStateFromLocalStorage();
  }

  hasExercise = computed(() => this.trackedExercises().length > 0);

  totalVolume = computed(() => {
    return this.trackedExercises().reduce((acc, exercise) => {
      const exerciseVolume = exercise.sets.reduce((setAcc, set) => {
        if (set.is_warmup) return setAcc;
        return setAcc + (set.weight_lifted ?? 0) * (set.reps_completed ?? 0);
      }, 0);
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

  isRestActive = computed(() => {
    const remaining = this.restRemainingSeconds();
    return remaining !== null && remaining > 0;
  });

  /** Rest countdown as zero-padded `MM:SS`. */
  restTimerFormatted = computed(() => {
    const total = this.restRemainingSeconds() ?? 0;
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
      restEndsAt: this.restEndsAt(),
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

        const restEndsAt = typeof parsed.restEndsAt === 'number' ? parsed.restEndsAt : null;
        if (restEndsAt !== null && restEndsAt > Date.now()) {
          this.restEndsAt.set(restEndsAt);
          this.syncRestRemaining();
          this.ensureRestInterval();
        }
      } catch (error) {
        console.error('Gagal me-restore session dari local storage', error);
      } finally {
        this.isRestoring = false;
      }
    }
  }

  async getExerciseById(id: number) {
    return this.dbService.getExerciseByKey(id);
  }

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
          reps_completed: pe.target_reps,
          weight_lifted: pe.target_weight,
          target_reps: pe.target_reps,
          target_weight: pe.target_weight,
          rest_time_taken_sec: pe.target_rest_time,
        }));

        activeExercises.push({
          id: Date.now() + Math.floor(Math.random() * 1000) + pe.id,
          exercise: exercise,
          plannedExercise: pe,
          sets: sets,
        });
      }
      this.trackedExercises.set(activeExercises);
    }
  }

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

  stopSessionTimer() {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = undefined;
    }
  }

  /**
   * Starts (or restarts) rest for the given duration.
   * A new call replaces any in-progress rest, matching set-completion behavior.
   */
  startRestTimer(seconds: number) {
    if (!seconds || seconds <= 0) return;

    this.restEndsAt.set(Date.now() + seconds * 1000);
    this.syncRestRemaining();
    this.ensureRestInterval();
  }

  /** Extends the current rest countdown. No-op when rest is not active. */
  addRestTime(seconds: number) {
    const end = this.restEndsAt();
    if (end === null || end <= Date.now() || !seconds) return;

    this.restEndsAt.set(end + seconds * 1000);
    this.syncRestRemaining();
  }

  skipRestTimer() {
    this.clearRestTimer();
  }

  clearRestTimer() {
    if (this.restInterval) {
      clearInterval(this.restInterval);
      this.restInterval = undefined;
    }
    this.restEndsAt.set(null);
    this.restRemainingSeconds.set(null);
  }

  private syncRestRemaining(): boolean {
    const end = this.restEndsAt();
    if (end === null) {
      this.restRemainingSeconds.set(null);
      return false;
    }

    const remaining = Math.ceil((end - Date.now()) / 1000);
    if (remaining <= 0) {
      this.restRemainingSeconds.set(null);
      return false;
    }

    this.restRemainingSeconds.set(remaining);
    return true;
  }

  private ensureRestInterval() {
    if (this.restInterval) return;

    this.restInterval = setInterval(() => {
      if (!this.syncRestRemaining()) {
        this.clearRestTimer();
      }
    }, 1000);
  }

  async getLoggedWorkoutSessions(): Promise<LoggedSession[]> {
    const loggedSessions = await this.dbService.getLoggedSessions();
    return loggedSessions.sort(
      (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
    );
  }

  addTrackedExercise(exercise: Exercise) {
    this.startSessionTimer();

    this.trackedExercises.update((current) => {
      /** Prevent duplicates in active list */
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

  removeTrackedExercise(exerciseId: number) {
    this.trackedExercises.update((current) =>
      current.filter((te) => te.exercise.id !== exerciseId),
    );
  }

  /**
   * Swaps one tracked exercise for another in the same position.
   * Logged weight, reps, and completed state move with the sets.
   * Does not touch the routine, the rest timer, or the session clock.
   */
  replaceTrackedExercise(
    exerciseId: number,
    replacement: Exercise,
    savedTargets: ReplacementTargets | null = null,
  ): boolean {
    const current = this.trackedExercises();
    const index = current.findIndex((tracked) => tracked.exercise.id === exerciseId);
    if (index === -1) return false;
    if (replacement.id === exerciseId) return false;
    if (current.some((tracked) => tracked.exercise.id === replacement.id)) return false;

    const tracked = current[index];
    const sets = setsAfterExerciseReplace(tracked.sets, savedTargets);
    const next: LoggedExercise = {
      ...tracked,
      exercise: replacement,
      sets,
      plannedExercise: nextPlannedExercise(savedTargets, replacement.id, index, sets.length),
    };
    const updated = current.slice();
    updated[index] = next;
    this.trackedExercises.set(updated);
    return true;
  }

  /** Plan targets for an exercise, if the running routine has any. Does not save the plan. */
  async savedTargetsForExercise(exerciseId: number): Promise<ReplacementTargets | null> {
    const planId = this.selectedPlanId();
    if (planId === null) return null;
    const plan = await this.dbService.getWorkoutPlan(planId);
    return findSavedExerciseTargets(plan, exerciseId, this.selectedSessionId());
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
          set_number: idx + 1,
        }));

      updatedExercises[index] = tracked;
      return updatedExercises;
    });
  }

  /** Stops the active session without clearing stored data entirely. */
  stopSession() {
    this.stopSessionTimer();
    this.clearRestTimer();
    this.trackedExercises.set([]);
    this.sessionStartTime.set(null);
    this.sessionDuration.set(0);
  }

  clearSession() {
    this.stopSession();
    this.selectedPlanId.set(null);
    this.selectedSessionId.set(null);
    this.sessionTitle.set('');
    localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
  }

  /** Initiates the active session flow, prompting the user if one is already active. */
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
   * Refreshes exercise metadata in active session from DB (fixes stale primaryMuscle after edit).
   * Called after ExerciseEdit or on view enter.
   */
  async refreshTrackedExercises() {
    const current = this.trackedExercises();
    if (current.length === 0) return;
    const refreshed: LoggedExercise[] = [];
    for (const te of current) {
      const fresh = await this.getExerciseById(te.exercise.id);
      if (fresh) {
        refreshed.push({ ...te, exercise: fresh });
      } else {
        refreshed.push(te);
      }
    }
    this.trackedExercises.set(refreshed);
  }

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
