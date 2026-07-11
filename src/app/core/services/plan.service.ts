import { Injectable, inject, signal } from '@angular/core';
import { DbService } from './db.service';
import { Exercise, WorkoutPlanSession, WorkoutPlanExercise } from '@/shared/models';

@Injectable({
  providedIn: 'root',
})
/**
 * Service to manage workout plan sessions and their planned exercises.
 * @example
 * const planService = inject(PlanService);
 * planService.addPlannedExercise(exercise);
 */
export class PlanService {
  private dbService = inject(DbService);

  selectedPlanId = signal<number | null>(null);
  sessionTitle = signal<string>('');
  plannedExercises = signal<WorkoutPlanExercise[]>([]);

  /**
   * Adds an exercise to the current planned session.
   * @param {Exercise} exercise The exercise to add.
   * @returns {void}
   * @example
   * this.planService.addPlannedExercise(exercise);
   */
  addPlannedExercise(exercise: Exercise) {
    if (!exercise || exercise.id === undefined || exercise.id === null) {
      console.warn('Cannot add an invalid or undefined exercise:', exercise);
      return;
    }
    this.plannedExercises.update((current) => {
      if (current.find((pe) => pe.exercise_id === exercise.id)) {
        return current;
      }
      const newPlannedExercise: WorkoutPlanExercise = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        exercise_order: current.length,
        target_sets: 3,
        target_reps: 10,
        target_weight: 0,
        exercise_id: exercise.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return [...current, newPlannedExercise];
    });
  }

  /**
   * Updates an existing planned exercise in the session.
   * @param {number} exerciseId The ID of the exercise to update.
   * @param {Partial<WorkoutPlanExercise>} updates The properties to update.
   * @returns {void}
   * @example
   * this.planService.updatePlannedExercise(1, { target_sets: 4 });
   */
  updatePlannedExercise(exerciseId: number, updates: Partial<WorkoutPlanExercise>) {
    this.plannedExercises.update((current) =>
      current.map((pe) =>
        pe.exercise_id === exerciseId
          ? { ...pe, ...updates, updatedAt: new Date().toISOString() }
          : pe,
      ),
    );
  }

  /**
   * Removes a planned exercise from the session.
   * @param {number} exerciseId The ID of the exercise to remove.
   * @returns {void}
   * @example
   * this.planService.removePlannedExercise(1);
   */
  removePlannedExercise(exerciseId: number) {
    this.plannedExercises.update((current) =>
      current
        .filter((pe) => pe.exercise_id !== exerciseId)
        .map((pe, index) => ({
          ...pe,
          exercise_order: index,
        })),
    );
  }

  /**
   * Loads a session from an existing plan into the service state.
   * @param {number} planId The ID of the plan.
   * @param {number} sessionId The ID of the session within the plan.
   * @returns {Promise<void>}
   * @example
   * await this.planService.setSessionFromPlan(1, 2);
   */
  async setSessionFromPlan(planId: number, sessionId: number) {
    const plan = await this.dbService.getWorkoutPlan(planId);
    if (!plan) throw new Error('Plan not found');

    const session = plan.sessions.find((s) => s.id === sessionId);
    if (!session) throw new Error('Session not found in plan');

    this.sessionTitle.set(session.title);
    this.selectedPlanId.set(plan.id);

    if (session.exercises) {
      this.plannedExercises.set(session.exercises);
    } else {
      this.plannedExercises.set([]);
    }
  }

  /**
   * Creates and saves a new session into the currently selected plan.
   * @returns {Promise<void>}
   * @example
   * await this.planService.createSession();
   */
  async createSession() {
    if (this.plannedExercises().length === 0) return;

    const planSession: WorkoutPlanSession = {
      id: Date.now(),
      title: this.sessionTitle() || 'New Template Session',
      session_order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      exercises: this.plannedExercises().map((pe, index) => ({
        id: pe.id || Date.now() + Math.floor(Math.random() * 1000),
        exercise_order: index,
        target_sets: pe.target_sets,
        target_reps: pe.target_reps,
        target_weight: pe.target_weight,
        exercise_id: pe.exercise_id,
        createdAt: pe.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    };

    const plan = await this.dbService.getWorkoutPlan(this.selectedPlanId()!);
    if (!plan) throw new Error('The plan is not found');

    planSession.session_order = plan.sessions.length;
    plan.sessions = [...(plan.sessions || []), planSession];
    await this.dbService.saveWorkoutPlan(plan);
    console.log('Template session successfully saved to plan!');

    this.clearPlanSession();
  }

  /**
   * Updates an existing session in the currently selected plan.
   * @param {number} sessionId The ID of the session to update.
   * @returns {Promise<void>}
   * @example
   * await this.planService.updateSession(2);
   */
  async updateSession(sessionId: number) {
    const plan = await this.dbService.getWorkoutPlan(this.selectedPlanId()!);
    if (!plan) throw new Error('The plan is not found');

    const sessionIndex = plan.sessions.findIndex((s) => s.id === sessionId);
    if (sessionIndex === -1) throw new Error('Session not found in plan');

    plan.sessions[sessionIndex] = {
      ...plan.sessions[sessionIndex],
      title: this.sessionTitle() || plan.sessions[sessionIndex].title || 'Updated Template Session',
      updatedAt: new Date().toISOString(),
      exercises: this.plannedExercises().map((pe, index) => ({
        id: pe.id || Date.now() + Math.floor(Math.random() * 1000),
        exercise_order: index,
        target_sets: pe.target_sets,
        target_reps: pe.target_reps,
        target_weight: pe.target_weight,
        exercise_id: pe.exercise_id,
        createdAt: pe.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    };

    await this.dbService.saveWorkoutPlan(plan);
  }

  /**
   * Deletes a session from a specific plan.
   * @param {number} planId The ID of the plan.
   * @param {number} sessionId The ID of the session to delete.
   * @returns {Promise<void>}
   * @example
   * await this.planService.deleteSessionFromPlan(1, 2);
   */
  async deleteSessionFromPlan(planId: number, sessionId: number): Promise<void> {
    const plan = await this.dbService.getWorkoutPlan(planId);
    if (!plan) throw new Error('Plan not found');

    plan.sessions = (plan.sessions || []).filter((s) => s.id !== sessionId);
    await this.dbService.saveWorkoutPlan(plan);
  }

  /**
   * Clears the current session state in the service.
   * @returns {void}
   * @example
   * this.planService.clearPlanSession();
   */
  clearPlanSession() {
    this.selectedPlanId.set(null);
    this.sessionTitle.set('');
    this.plannedExercises.set([]);
  }
}
