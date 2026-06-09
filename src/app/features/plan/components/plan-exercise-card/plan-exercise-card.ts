import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash2, lucideDumbbell } from '@ng-icons/lucide';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { ZardInputDirective } from '@/shared/components/zard/input';
import { ZardBadgeComponent } from '@/shared/components/zard/badge';
import { ZardFormImports } from '@/shared/components/zard/form';
import { WorkoutPlanExercise } from '@/shared/models/workout.model';

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
  providers: [provideIcons({ lucideTrash2, lucideDumbbell })],
  templateUrl: './plan-exercise-card.html',
})
export class PlanExerciseCardComponent {
  plannedExercise = input.required<WorkoutPlanExercise>();
  
  updateTarget = output<Partial<WorkoutPlanExercise>>();
  remove = output<void>();

  onSetsChange(val: string) {
    const sets = parseInt(val, 10);
    this.updateTarget.emit({ target_sets: isNaN(sets) ? 0 : sets });
  }

  onWeightChange(val: string) {
    const weight = parseFloat(val);
    this.updateTarget.emit({ target_weight: isNaN(weight) ? 0 : weight });
  }

  onRepsChange(val: string) {
    const reps = parseInt(val, 10);
    this.updateTarget.emit({ target_reps: isNaN(reps) ? 0 : reps });
  }

  onRemoveClick() {
    this.remove.emit();
  }
}
