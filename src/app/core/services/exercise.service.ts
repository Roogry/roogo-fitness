import { Injectable, inject } from '@angular/core';
import { Exercise } from '@/shared/models';
import { DbService } from './db.service';

@Injectable({
  providedIn: 'root',
})
export class ExerciseService {
  private dbService = inject(DbService);

  async getExerciseById(id: number): Promise<Exercise | undefined> {
    return this.dbService.getExerciseByKey(id);
  }

  async searchExercises(query: string): Promise<Exercise[]> {
    const exercises = await this.dbService.getExercises();
    if (!query.trim()) return exercises;

    const lowerQuery = query.toLowerCase();
    return exercises.filter((e) => e.name.toLowerCase().includes(lowerQuery));
  }

  async addCustomExercise(name: string): Promise<Exercise> {
    const newExercise: Exercise = {
      id: Date.now(),
      name,
      media: [],
    };
    await this.dbService.saveExercise(newExercise);
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
