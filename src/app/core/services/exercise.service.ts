import { Injectable, inject } from '@angular/core';
import { Exercise } from '@/shared/models';
import { DbService } from './db.service';
import {
  JourneyStats,
  RecentExerciseSession,
} from '@/features/exercise/models/exercise-journey.model';

@Injectable({
  providedIn: 'root',
})
/**
 * Service to manage exercise data and operations.
 * @example
 * const exerciseService = inject(ExerciseService);
 * const exercises = await exerciseService.getExercises('push');
 */
export class ExerciseService {
  private dbService = inject(DbService);

  /**
   * Retrieves a specific exercise by its ID.
   * @param {number} id The ID of the exercise.
   * @returns {Promise<Exercise | undefined>} A promise resolving to the exercise, or undefined if not found.
   * @example
   * const exercise = await this.exerciseService.getExerciseById(1);
   */
  async getExerciseById(id: number): Promise<Exercise | undefined> {
    return this.dbService.getExerciseByKey(id);
  }

  /**
   * Loads a list of exercises by their IDs into an existing Map.
   * @param {number[]} exerciseIds The array of exercise IDs to load.
   * @param {Map<number, Exercise>} currentMap The current map of exercises.
   * @returns {Promise<{ map: Map<number, Exercise>; changed: boolean }>} A promise resolving to an object with the updated map and a changed flag.
   * @example
   * const result = await this.exerciseService.loadExercisesToMap([1, 2], new Map());
   */
  async loadExercisesToMap(
    exerciseIds: number[],
    currentMap: Map<number, Exercise>,
  ): Promise<{ map: Map<number, Exercise>; changed: boolean }> {
    const newMap = new Map(currentMap);
    let changed = false;

    for (const id of exerciseIds) {
      if (!newMap.has(id)) {
        const ex = await this.getExerciseById(id);
        if (ex) {
          newMap.set(id, ex);
          changed = true;
        }
      }
    }
    return { map: newMap, changed };
  }

  /**
   * Retrieves all exercises, optionally filtered by a search query.
   * @param {string} query The search string to filter exercises by name.
   * @returns {Promise<Exercise[]>} A promise resolving to an array of matched exercises.
   * @example
   * const exercises = await this.exerciseService.getExercises('bench');
   */
  async getExercises(query: string): Promise<Exercise[]> {
    const exercises = await this.dbService.getExercises();
    if (!query.trim()) return exercises;

    const lowerQuery = query.toLowerCase();
    return exercises.filter((e) => e.name.toLowerCase().includes(lowerQuery));
  }

  /**
   * Creates and saves a new custom exercise.
   * @param {string} name The name of the new exercise.
   * @returns {Promise<Exercise>} A promise resolving to the newly created exercise.
   * @example
   * const newExercise = await this.exerciseService.addCustomExercise('Custom Pushup');
   */
  async addCustomExercise(name: string): Promise<Exercise> {
    const newExercise: Exercise = {
      id: Date.now(),
      name,
      media: [],
    };
    await this.dbService.saveExercise(newExercise);
    return newExercise;
  }

  /**
   * Updates an existing exercise with new data.
   * @param {Exercise} current The current exercise object.
   * @param {Partial<Exercise>} updates The properties to update.
   * @returns {void}
   * @example
   * this.exerciseService.updateExercise(exercise, { name: 'Updated Name' });
   */
  async updateExercise(current: Exercise, updates: Partial<Exercise>) {
    await this.dbService.saveExercise({ ...current, ...updates });
  }

  /**
   * Retrieves exercises that target a specific primary muscle.
   * @param {number} muscleId The ID of the primary muscle.
   * @returns {Promise<Exercise[]>} A promise resolving to an array of exercises.
   * @example
   * const exercises = await this.exerciseService.getExercisesByMuscle(1);
   */
  async getExercisesByMuscle(muscleId: number): Promise<Exercise[]> {
    const exercises = await this.dbService.getExercises();
    return exercises.filter((e) => e.primary_muscle?.id === muscleId);
  }

  /**
   * Retrieves journey statistics (personal records, recent sessions) for a specific exercise.
   * @param {number} exerciseId The ID of the exercise.
   * @param {number} [limit=4] The maximum number of recent sessions to retrieve.
   * @returns {Promise<JourneyStats>} A promise resolving to the exercise journey statistics.
   * @example
   * const stats = await this.exerciseService.getExerciseJourneyStats(1, 5);
   */
  async getExerciseJourneyStats(exerciseId: number, limit: number = 4): Promise<JourneyStats> {
    const sessions = await this.dbService.getLoggedSessions();

    let highestWeight = 0;
    let highestWeightReps = 0;
    let totalSets = 0;
    let lastLogged: string | undefined = undefined;
    const recentSessions: RecentExerciseSession[] = [];

    // Sessions are already sorted by start_time descending in DbService.getLoggedSessions()
    for (const session of sessions) {
      if (session.workouts) {
        const matchingWorkout = session.workouts.find((w) => w.exercise.id === exerciseId);

        if (matchingWorkout && matchingWorkout.sets) {
          totalSets += matchingWorkout.sets.length;

          // The first matching session we encounter is the most recent one
          if (!lastLogged) {
            lastLogged = session.start_time;
          }

          for (const set of matchingWorkout.sets) {
            if (set.weight_lifted !== undefined && set.weight_lifted !== null) {
              if (set.weight_lifted > highestWeight) {
                highestWeight = set.weight_lifted;
                highestWeightReps = set.reps_completed ?? 0;
              } else if (set.weight_lifted === highestWeight) {
                const reps = set.reps_completed ?? 0;
                if (reps > highestWeightReps) {
                  highestWeightReps = reps;
                }
              }
            }
          }

          if (matchingWorkout.sets.length > 0 && recentSessions.length < limit) {
            recentSessions.push({
              id: session.id,
              sessionTitle: session.session_title,
              startTime: session.start_time,
              sets: matchingWorkout.sets.map((set) => ({
                id: set.id,
                set_number: set.set_number,
                weight_lifted: set.weight_lifted,
                reps_completed: set.reps_completed,
              })),
            });
          }
        }
      }
    }

    return {
      highestWeight,
      highestWeightReps,
      totalSets,
      lastLogged,
      recentSessions,
    };
  }
}
