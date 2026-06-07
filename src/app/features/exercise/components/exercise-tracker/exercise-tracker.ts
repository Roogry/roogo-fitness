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
import { LoggedExercise, LoggedSet } from '@/shared/models/workout.model';
import { ZardFormImports } from '@/shared/components/zard/form';

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

  updateSet(setId: number, updates: Partial<LoggedSet>) {
    this.workoutService.updateSet(this.trackedExercise().exercise.id, setId, updates);
  }

  removeSet(setId: number) {
    this.workoutService.removeSet(this.trackedExercise().exercise.id, setId);
  }

  removeExercise() {
    this.workoutService.removeTrackedExercise(this.trackedExercise().exercise.id);
  }
}
