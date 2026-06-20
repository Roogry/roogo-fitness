import { Exercise } from './exercise.model';

export interface WorkoutPlan {
  id: number;
  user_id?: number;
  title: string;
  description?: string;
  days: number; // sessions per week
  isDefault?: boolean;
  isActive?: boolean; // Indicates the current active plan for the home page
  createdAt?: string;
  updatedAt?: string;
  sessions: WorkoutPlanSession[]; // Nested array of planned sessions
}

export interface WorkoutPlanSession {
  id: number; // Timestamp based
  title: string;
  session_order: number; // Order to show within the plan
  createdAt?: string;
  updatedAt?: string;
  exercises?: WorkoutPlanExercise[];
}

export interface WorkoutPlanExercise {
  id: number;
  exercise_order: number; // Order to show within the plan session
  target_sets?: number;
  target_weight?: number;
  target_reps?: number;
  target_rest_time?: number;
  createdAt?: string;
  updatedAt?: string;
  exercise: Exercise;
}
