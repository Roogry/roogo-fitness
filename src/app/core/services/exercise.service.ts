import { Injectable, inject, signal } from '@angular/core';
import { Exercise } from '@/shared/models/workout.model';
import { DbService } from './db.service';
import { mockExercises } from '@/core/mocks/workout.mock';

@Injectable({
  providedIn: 'root',
})
export class ExerciseService {
  private dbService = inject(DbService);

  private mockExercises = [...mockExercises];

  async getExerciseById(id: number): Promise<Exercise | undefined> {
    return this.mockExercises.find((e) => e.id === id);
  }

  async searchExercises(query: string): Promise<Exercise[]> {
    const exercises = await this.dbService.getExercises();
    if (!query.trim()) return exercises;

    const lowerQuery = query.toLowerCase();
    return exercises.filter((e) => e.name.toLowerCase().includes(lowerQuery));
  }

  addCustomExercise(name: string): Exercise {
    const newExercise: Exercise = {
      id: Date.now(),
      name,
      media: [],
    };
    this.mockExercises.push(newExercise);
    return newExercise;
  }

  updateExercise(current: Exercise, updates: Partial<Exercise>) {
    this.dbService.saveExercise({ ...current, ...updates });
  }

  async getExercisesByMuscle(muscleId: number): Promise<Exercise[]> {
    const exercises = await this.dbService.getExercises();
    return exercises.filter((e) => e.primary_muscle?.id === muscleId);
  }
}
