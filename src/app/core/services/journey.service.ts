import { Injectable, inject } from '@angular/core';
import { DbService } from './db.service';
import { JourneyStats, RecentExerciseSession } from '@/shared/models/workout.model';

@Injectable({
  providedIn: 'root',
})
export class JourneyService {
  private dbService = inject(DbService);

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
