import { Injectable, inject } from '@angular/core';
import { Muscle } from '@/shared/models';
import { DbService } from './db.service';

@Injectable({
  providedIn: 'root',
})
/**
 * Service to fetch and manage muscle data.
 * @example
 * const muscleService = inject(MuscleService);
 * const muscles = await muscleService.getMuscles();
 */
export class MuscleService {
  // Services
  private dbService = inject(DbService);

  /**
   * Retrieves all muscles, with a slight simulated delay.
   * @returns {Promise<Muscle[]>} A promise resolving to an array of muscles.
   * @example
   * const muscles = await this.muscleService.getMuscles();
   */
  async getMuscles(): Promise<Muscle[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return await this.dbService.getMuscles();
  }
}
