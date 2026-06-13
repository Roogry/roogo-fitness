import { Injectable, inject } from '@angular/core';
import { DbService } from './db.service';
import { LoggedSession } from '@/shared/models/workout.model';

@Injectable({
  providedIn: 'root',
})
export class JourneyService {
  private dbService = inject(DbService);

  async getHighestWeight(exerciseId: number): Promise<number> {
    const sessions = await this.dbService.getLoggedSessions();
    let highestWeight = 0;

    for (const session of sessions) {
      if (session.workouts) {
        for (const workout of session.workouts) {
          if (workout.exercise.id === exerciseId && workout.sets) {
            for (const set of workout.sets) {
              if (set.weight_lifted && set.weight_lifted > highestWeight) {
                highestWeight = set.weight_lifted;
              }
            }
          }
        }
      }
    }

    return highestWeight;
  }

  async getTotalSets(exerciseId: number): Promise<number> {
    const sessions = await this.dbService.getLoggedSessions();
    let totalSets = 0;

    for (const session of sessions) {
      if (session.workouts) {
        for (const workout of session.workouts) {
          if (workout.exercise.id === exerciseId && workout.sets) {
            totalSets += workout.sets.length;
          }
        }
      }
    }

    return totalSets;
  }

  async getRecentSessions(exerciseId: number, limit: number = 4): Promise<any[]> {
    const sessions = await this.dbService.getLoggedSessions();
    const result: any[] = [];

    // Sessions are already sorted by start_time descending in DbService.getLoggedSessions()
    for (const session of sessions) {
      if (session.workouts) {
        const matchingWorkout = session.workouts.find(
          (w) => w.exercise.id === exerciseId
        );

        if (matchingWorkout && matchingWorkout.sets && matchingWorkout.sets.length > 0) {
          result.push({
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

          if (result.length === limit) {
            break;
          }
        }
      }
    }

    return result;
  }
}
