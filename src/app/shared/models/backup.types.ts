import { Exercise, Muscle } from './exercise.types';
import { LoggedSession } from './logged-session.types';
import { WorkoutPlan } from './workout-plan.types';

/**
 * Backup files written by this app.
 * Version 1 has no seed_version. Version 2 records the exercise library it was exported from.
 */
export interface BackupFile {
  version: 1 | 2;
  seed_version?: number;
  workout_plans: WorkoutPlan[];
  logged_sessions: LoggedSession[];
  exercises: Exercise[];
  muscles: Muscle[];
}
