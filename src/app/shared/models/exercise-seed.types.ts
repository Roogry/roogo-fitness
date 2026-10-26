import { Exercise, Muscle } from './exercise.types';

export interface ExerciseSeed {
  seed_version: number;
  muscles: Muscle[];
  exercises: Exercise[];
}
