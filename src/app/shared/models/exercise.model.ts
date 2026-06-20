export interface Range {
  min: number;
  max: number;
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
  recommended_warmup_sets?: Range;
  recommended_working_sets?: Range;
  recommended_rpe?: Range;
  recommended_rest_time_sec?: Range;
  secondary_muscles?: Muscle[];
  media: ExerciseMedia[];
  instructions?: string[];
  tips?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExerciseMedia {
  id: number;
  media_type: 'image' | 'video' | 'youtube' | string;
  media_url: string;
  display_order: number;
}
