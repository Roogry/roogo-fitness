import { Injectable, inject } from '@angular/core';
import { Muscle } from '@/shared/models';
import { sortMuscles } from '@/shared/utils/muscle.utils';
import { DbService } from './db.service';

@Injectable({
  providedIn: 'root',
})
export class MuscleService {
  private dbService = inject(DbService);

  /** All muscles in body-region order, after a short simulated delay. */
  async getMuscles(): Promise<Muscle[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const muscles = await this.dbService.getMuscles();
    return sortMuscles(muscles);
  }
}
