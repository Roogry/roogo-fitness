export type SessionMode = 'create' | 'update' | 'start';

export interface ExerciseMedia {
  id: number;
  media_type: 'image' | 'video' | 'youtube' | string;
  media_url: string;
  display_order: number;
}

export interface Muscle {
  id: number;
  name: string;
  anatomy_image_url?: string;
}

export interface Exercise {
  id: number;
  name: string;
  short_description?: string;
  primary_muscle?: Muscle;
  recommended_warmup_sets?: number;
  recommended_working_sets?: number;
  recommended_rpe?: number;
  recommended_rest_time_sec?: number;
  secondary_muscles?: Muscle[];
  media: ExerciseMedia[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkoutSet {
  id: string; // unique id for local editing
  exercise_id: number;
  set_number: number;
  weight_lifted: number;
  reps_completed: number;
}

export interface TrackedExercise {
  exercise: Exercise;
  sets: WorkoutSet[];
}

export interface LoggedSet {
  id: number;
  logged_workout_id: number;
  exercise_id: number;
  set_number: number;
  is_warmup: boolean;
  reps_completed: number;
  weight_lifted: number;
  rpe_logged?: number;
  rest_time_taken_sec?: number;
  completed_at?: string;
}

export interface LoggedWorkout {
  id: number;
  logged_workout_session_id?: number | null;
  session_exercises_id?: number | null;
  exercise_id: number;
  exercise?: Exercise; // Joined for UI convenience
  workout_title: string;
  sets: LoggedSet[];
}

export interface LoggedWorkoutSession {
  id: number;
  user_id: string;
  workout_session_id?: number | null;
  session_title: string;
  start_time: string;
  end_time?: string;
  total_duration: number;
  total_weight_lifted: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  workouts: LoggedWorkout[]; 
}

export interface WorkoutExercise {
  exercise_id: number;
  order: number;
  target_sets?: number;
  target_reps?: number;
  target_rest_time?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkoutPlanSession {
  id: number; // Timestamp based
  title: string;
  session_order: number; // Order to show within the plan
  createdAt?: string;
  updatedAt?: string;
  workout_exercises?: WorkoutExercise[]; 
}

export interface WorkoutPlan {
  id: number;
  title: string;
  description?: string;
  days: number; // sessions per week
  isDefault?: boolean;
  isActive?: boolean; // Indicates the current active plan for the home page
  createdAt?: string;
  updatedAt?: string;
  sessions: WorkoutPlanSession[]; // Nested array of planned sessions
}
