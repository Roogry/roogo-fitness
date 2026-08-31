import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { form, FormField, minLength, required, submit } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash2, lucidePlus, lucideDumbbell, lucideCheck } from '@ng-icons/lucide';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { ZardInputDirective } from '@/shared/components/zard/input';
import { ZardBadgeComponent } from '@/shared/components/zard/badge';
import { ZardCheckboxComponent } from '@/shared/components/zard/checkbox';
import { LoggedExercise, LoggedSet } from '@/shared/models';
import { ZardFormImports } from '@/shared/components/zard/form';

/**
 * A component that tracks an active exercise session, allowing the user to log sets, weight, and reps.
 *
 * This component is stateless regarding persistence: in editable mode it only emits events.
 * The parent page decides where the edits are applied (e.g. the active session service
 * or a local copy of a logged session being edited).
 *
 * @property {LoggedExercise} trackedExercise - The specific exercise instance currently being tracked.
 * @property {boolean} editable - Whether the tracker inputs can be modified.
 * @property {{ exerciseId: number; weight: number; reps: number }} addSetSubmitted - Emitted when a new set is submitted.
 * @property {{ exerciseId: number; setId: number; updates: Partial<LoggedSet> }} setUpdated - Emitted when a set value changes.
 * @property {{ exerciseId: number; setId: number }} setRemoved - Emitted when a set is removed.
 * @property {{ exerciseId: number }} exerciseRemoved - Emitted when the whole exercise is removed.
 *
 * @example
 * <app-exercise-tracker
 *   [trackedExercise]="currentExercise"
 *   [editable]="true"
 *   (addSetSubmitted)="onAddSet($event)"
 *   (setUpdated)="onSetUpdate($event)"
 *   (setRemoved)="onSetRemove($event)"
 *   (exerciseRemoved)="onExerciseRemove($event)"
 * ></app-exercise-tracker>
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
    ZardCheckboxComponent,
    ZardFormImports,
  ],
  providers: [provideIcons({ lucideTrash2, lucidePlus, lucideDumbbell, lucideCheck })],
  templateUrl: './exercise-tracker.html',
  styleUrl: './exercise-tracker.css',
})
export class ExerciseTracker {
  // The exercise data passed from the parent
  trackedExercise = input.required<LoggedExercise>();
  editable = input<boolean>(false);

  // Events emitted to the parent, which owns the data updates
  readonly addSetSubmitted = output<{ exerciseId: number; weight: number; reps: number }>();
  readonly setUpdated = output<{
    exerciseId: number;
    setId: number;
    updates: Partial<LoggedSet>;
  }>();
  readonly setRemoved = output<{ exerciseId: number; setId: number }>();
  readonly exerciseRemoved = output<{ exerciseId: number }>();

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
   * Handles the submission of the new workout set form and notifies the parent.
   *
   * @example
   * // Triggered on user clicking Add Set button
   * this.onAddWorkoutSetClick();
   */
  onAddWorkoutSetClick() {
    submit(this.workoutSetForm, async (f) => {
      this.addSetSubmitted.emit({
        exerciseId: this.trackedExercise().exercise.id,
        weight: parseFloat(f.weight().value()),
        reps: parseInt(f.reps().value(), 10),
      });
      // Keep weight but clear reps
      this.workoutSetModel.update((m) => ({ ...m, reps: '' }));
      this.workoutSetForm().reset();
    });
  }

  /**
   * Notifies the parent that an existing logged set should be updated.
   *
   * @param {number} setId - The ID of the logged set to update.
   * @param {Partial<LoggedSet>} updates - The partial set data to update.
   *
   * @example
   * this.updateSet(1, { reps_completed: 10 });
   */
  updateSet(setId: number, updates: Partial<LoggedSet>) {
    this.setUpdated.emit({ exerciseId: this.trackedExercise().exercise.id, setId, updates });
  }

  /**
   * Notifies the parent that a set should be removed from the logged session.
   *
   * @param {number} setId - The ID of the set to remove.
   *
   * @example
   * this.removeSet(1);
   */
  removeSet(setId: number) {
    this.setRemoved.emit({ exerciseId: this.trackedExercise().exercise.id, setId });
  }

  /**
   * Notifies the parent that the entire tracked exercise should be removed.
   *
   * @example
   * this.removeExercise();
   */
  toggleWarmup(set: LoggedSet) {
    const newVal = !set.is_warmup;
    this.setUpdated.emit({
      exerciseId: this.trackedExercise().exercise.id,
      setId: set.id,
      updates: { is_warmup: newVal },
    });
  }

  toggleCompleted(set: LoggedSet) {
    const isCompleted = !!set.completed_at;
    const updates: Partial<LoggedSet> = isCompleted
      ? { completed_at: undefined }
      : { completed_at: new Date().toISOString() };
    this.setUpdated.emit({
      exerciseId: this.trackedExercise().exercise.id,
      setId: set.id,
      updates,
    });
  }

  removeExercise() {
    this.exerciseRemoved.emit({ exerciseId: this.trackedExercise().exercise.id });
  }
}
