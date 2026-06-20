import { Component, input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { form, FormField, minLength, required, submit, validate } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash2, lucidePlus, lucideDumbbell } from '@ng-icons/lucide';
import { WorkoutService } from '@/core/services/workout.service';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { ZardInputDirective } from '@/shared/components/zard/input';
import { ZardBadgeComponent } from '@/shared/components/zard/badge';
import { LoggedExercise, LoggedSet } from '@/shared/models';
import { ZardFormImports } from '@/shared/components/zard/form';

/**
 * A component that tracks an active exercise session, allowing the user to log sets, weight, and reps.
 *
 * @property {LoggedExercise} trackedExercise - The specific exercise instance currently being tracked.
 * @property {boolean} editable - Whether the tracker inputs can be modified.
 *
 * @example
 * <app-exercise-tracker [trackedExercise]="currentExercise"></app-exercise-tracker>
 */
@Component({
  selector: 'app-exercise-tracker',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormField,
    NgIcon,
    ZardCardComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardBadgeComponent,
    ZardFormImports,
  ],
  providers: [provideIcons({ lucideTrash2, lucidePlus, lucideDumbbell })],
  templateUrl: './exercise-tracker.html',
  styleUrl: './exercise-tracker.css',
})
export class ExerciseTracker {
  private workoutService = inject(WorkoutService);

  // The exercise data passed from the parent
  trackedExercise = input.required<LoggedExercise>();
  editable = input<boolean>(false);

  // Local state for the "Add Set" form
  workoutSetModel = signal({
    weight: '',
    reps: '',
  });

  workoutSetForm = form(this.workoutSetModel, (f) => {
    required(f.weight, { message: 'Please enter weight' });
    minLength(f.weight, 1, { message: 'Weight must be greater than 0' });
    required(f.reps, { message: 'Please enter reps' });
    minLength(f.reps, 1, { message: 'Reps must be greater than 0' });
  });

  /**
   * Handles the submission of the new workout set form.
   *
   * @example
   * // Triggered on user clicking Add Set button
   * this.onAddWorkoutSetClick();
   */
  onAddWorkoutSetClick() {
    submit(this.workoutSetForm, async (f) => {
      this.workoutService.addSet(
        this.trackedExercise().exercise.id,
        parseFloat(f.weight().value()),
        parseInt(f.reps().value(), 10),
      );
      // Keep weight but clear reps
      this.workoutSetModel.update((m) => ({ ...m, reps: '' }));
      this.workoutSetForm().reset();
    });
  }

  /**
   * Updates an existing logged set with new values.
   *
   * @param {number} setId - The ID of the logged set to update.
   * @param {Partial<LoggedSet>} updates - The partial set data to update.
   *
   * @example
   * this.updateSet(1, { reps: 10 });
   */
  updateSet(setId: number, updates: Partial<LoggedSet>) {
    this.workoutService.updateSet(this.trackedExercise().exercise.id, setId, updates);
  }

  /**
   * Removes a specific set from the logged session.
   *
   * @param {number} setId - The ID of the set to remove.
   *
   * @example
   * this.removeSet(1);
   */
  removeSet(setId: number) {
    this.workoutService.removeSet(this.trackedExercise().exercise.id, setId);
  }

  /**
   * Removes the entire tracked exercise and all its sets from the session.
   *
   * @example
   * this.removeExercise();
   */
  removeExercise() {
    this.workoutService.removeTrackedExercise(this.trackedExercise().exercise.id);
  }
}
