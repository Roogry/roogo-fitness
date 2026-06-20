import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideTrash2,
  lucideDumbbell,
  lucideRepeat,
  lucideFlagTriangleLeft,
} from '@ng-icons/lucide';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { ZardInputDirective } from '@/shared/components/zard/input';
import { ZardBadgeComponent } from '@/shared/components/zard/badge';
import { ZardFormImports } from '@/shared/components/zard/form';
import { Exercise, WorkoutPlanExercise } from '@/shared/models';

/**
 * A card component displaying an individual exercise within a workout plan session, allowing edits to sets, reps, and weight.
 *
 * @example
 * <app-plan-exercise-card [plannedExercise]="exercise" [exercise]="exerciseDetails"></app-plan-exercise-card>
 */
@Component({
  selector: 'app-plan-exercise-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgIcon,
    ZardCardComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardBadgeComponent,
    ZardFormImports,
  ],
  providers: [provideIcons({ lucideTrash2, lucideDumbbell, lucideRepeat, lucideFlagTriangleLeft })],
  templateUrl: './plan-exercise-card.html',
})
export class PlanExerciseCardComponent {
  plannedExercise = input.required<WorkoutPlanExercise>();
  exercise = input.required<Exercise>();
  editable = input<boolean>(true);

  updateTarget = output<Partial<WorkoutPlanExercise>>();
  remove = output<void>();

  /**
   * Updates the target sets when the user changes the input.
   *
   * @param {string} val - The new number of sets as a string.
   *
   * @example
   * this.onSetsChange("3");
   */
  onSetsChange(val: string) {
    const sets = parseInt(val, 10);
    this.updateTarget.emit({ target_sets: isNaN(sets) ? 0 : sets });
  }

  /**
   * Updates the target weight when the user changes the input.
   *
   * @param {string} val - The new weight as a string.
   *
   * @example
   * this.onWeightChange("50.5");
   */
  onWeightChange(val: string) {
    const weight = parseFloat(val);
    this.updateTarget.emit({ target_weight: isNaN(weight) ? 0 : weight });
  }

  /**
   * Updates the target repetitions when the user changes the input.
   *
   * @param {string} val - The new number of repetitions as a string.
   *
   * @example
   * this.onRepsChange("12");
   */
  onRepsChange(val: string) {
    const reps = parseInt(val, 10);
    this.updateTarget.emit({ target_reps: isNaN(reps) ? 0 : reps });
  }

  onRemoveClick() {
    this.remove.emit();
  }
}
