import { Component, input, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkoutService } from '../../shared/services/workout.service';
import { ZardCardComponent } from '../../shared/components/card/card.component';
import { ZardButtonComponent } from '../../shared/components/button/button.component';
import { ZardInputDirective } from '../../shared/components/input/input.directive';
import { LucideAngularModule, Trash2, Plus, GripVertical, Dumbbell } from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { LoggedExercise, LoggedSet } from '@/shared/types/workout.types';
import { ZardBadgeComponent } from "@/shared/components/badge";

@Component({
  selector: 'app-exercise-tracker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardInputDirective,
    LucideAngularModule,
    RouterModule,
    ZardBadgeComponent
],
  templateUrl: './exercise-tracker.html',
  styleUrl: './exercise-tracker.css',
})
export class ExerciseTracker {
  readonly Trash2 = Trash2;
  readonly Plus = Plus;
  readonly GripVertical = GripVertical;
  readonly Dumbbell = Dumbbell;

  private workoutService = inject(WorkoutService);

  // The exercise data passed from the parent
  trackedExercise = input.required<LoggedExercise>();
  editable = input<boolean>(false);

  // Local state for the "Add Set" form
  newWeight = signal<number | null>(null);
  newReps = signal<number | null>(null);

  isValid = computed(() => {
    const w = this.newWeight();
    const r = this.newReps();
    return w !== null && w >= 0 && r !== null && r > 0;
  });

  addSet() {
    if (!this.isValid()) return;
    this.workoutService.addSet(
      this.trackedExercise().exercise.id,
      this.newWeight()!,
      this.newReps()!,
    );
    // Optionally keep the weight but clear reps for the next set to speed up entry
    this.newReps.set(null);
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
