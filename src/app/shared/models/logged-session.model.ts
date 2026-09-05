import { Exercise } from './exercise.model';

export interface LoggedSession {
  id: number;
  user_id?: number;
  workout_plan_session_id?: number | null;
  session_title: string;
  start_time: string;
  end_time?: string;
  total_duration: number;
  total_weight_lifted: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  workouts: LoggedExercise[];
}

import { WorkoutPlanExercise } from './workout-plan.model';

export interface LoggedExercise {
  id: number;
  logged_session_id?: number | null;
  exercise: Exercise;
  /** Plan-level targets. Present when session was started from a workout plan. */
  plannedExercise?: WorkoutPlanExercise;
  createdAt?: string;
  updatedAt?: string;
  sets: LoggedSet[];
}

export interface LoggedSet {
  id: number;
  logged_exercise_id?: number;
  set_number: number;
  reps_completed?: number;
  weight_lifted?: number;
  rest_time_taken_sec?: number;
  is_warmup?: boolean;
  completed_at?: string;
  createdAt?: string;
  updatedAt?: string;
  target_weight?: number;
  target_reps?: number;
}
