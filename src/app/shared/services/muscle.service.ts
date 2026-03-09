import { Injectable, inject } from '@angular/core';
import { Muscle } from '../types/workout.types';
import { DbService } from './db.service';

@Injectable({
  providedIn: 'root',
})
export class MuscleService {
  // Services
  private dbService = inject(DbService);
  
  async getMuscles(): Promise<Muscle[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return await this.dbService.getMuscles();
  }
}
