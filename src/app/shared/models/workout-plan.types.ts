export interface WorkoutPlan {
  id: number;
  user_id?: number;
  title: string;
  description?: string;
  /** sessions per week */
  days: number;
  isDefault?: boolean;
  /** Indicates the current active plan for the home page */
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  sessions: WorkoutPlanSession[];
}

export interface WorkoutPlanSession {
  /** Timestamp based */
  id: number;
  title: string;
  session_order: number;
  createdAt?: string;
  updatedAt?: string;
  exercises?: WorkoutPlanExercise[];
}

export interface WorkoutPlanExercise {
  id: number;
  exercise_order: number;
  target_sets?: number;
  target_weight?: number;
  target_reps?: number;
  target_rest_time?: number;
  createdAt?: string;
  updatedAt?: string;
  exercise_id: number;
}
