export type SessionAction = 'create' | 'edit' | 'detail' | 'start' | 'empty';

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

export interface ExerciseMedia {
  id: number;
  media_type: 'image' | 'video' | 'youtube' | string;
  media_url: string;
  display_order: number;
}


// Workout Plan
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
  exercise: Exercise
}

// Logged Workout Sessions
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

export interface LoggedExercise {
  id: number;
  logged_session_id?: number | null;
  exercise: Exercise;
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
}