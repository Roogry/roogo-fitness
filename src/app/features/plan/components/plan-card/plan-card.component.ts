import { Component, inject, signal, OnInit, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Exercise, WorkoutPlan, WorkoutPlanSession } from '@/shared/models';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { ZardPopoverComponent, ZardPopoverDirective } from '@/shared/components/zard/popover';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucidePlus,
  lucideDumbbell,
  lucideEllipsisVertical,
  lucideChevronRight,
  lucidePencil,
  lucideTrash2,
} from '@ng-icons/lucide';
import { WorkoutService } from '@/core/services/workout.service';
import { PlanService } from '@/core/services/plan.service';
import { ExerciseService } from '@/core/services/exercise.service';
import { Router } from '@angular/router';

/**
 * A card component displaying a user's workout plan, including its sessions and actions.
 *
 * @example
 * <app-plan-card [plan]="myPlan" (onToggle)="toggle()" (onEdit)="edit()"></app-plan-card>
 */
@Component({
  selector: 'app-plan-card',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardPopoverComponent,
    ZardPopoverDirective,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucidePlus,
      lucideDumbbell,
      lucideEllipsisVertical,
      lucideChevronRight,
      lucidePencil,
      lucideTrash2,
    }),
  ],
  templateUrl: './plan-card.html',
})
export class PlanCardComponent implements OnInit {
  readonly plan = input.required<WorkoutPlan>();
  readonly isExpanded = input(false);

  readonly onToggle = output<void>();
  readonly onEdit = output<Event>();
  readonly onDelete = output<Event>();

  router = inject(Router);
  workoutService = inject(WorkoutService);
  planService = inject(PlanService);
  exerciseService = inject(ExerciseService);
  isOpenPlanActions = signal(false);
  exerciseMap = signal<Map<number, Exercise>>(new Map());

  async ngOnInit() {
    const exercises = await this.exerciseService.getExercises('');
    const map = new Map<number, Exercise>();
    for (const ex of exercises) {
      map.set(ex.id, ex);
    }
    this.exerciseMap.set(map);
  }

  /**
   * Generates a brief summary string of the exercise names within a session.
   *
   * @param {WorkoutPlanSession} session - The workout plan session.
   * @returns {string} A summary string of exercise names.
   *
   * @example
   * const names = this.getExerciseNames(session);
   */
  getExerciseNames(session: WorkoutPlanSession): string {
    if (!session.exercises || session.exercises.length === 0) {
      return 'No exercises added yet.';
    }
    const map = this.exerciseMap();
    return session.exercises
      .filter((pe) => pe && pe.exercise_id !== undefined && pe.exercise_id !== null)
      .map((pe) => {
        const ex = map.get(pe.exercise_id);
        return ex ? ex.name : `Exercise #${pe.exercise_id}`;
      })
      .join(', ');
  }

  handleToggle() {
    this.onToggle.emit();
  }

  openPlanActionsSheet(event: Event) {
    event.stopPropagation();
    this.planService.selectedPlanId.set(this.plan().id);
  }

  editPlan(event: Event) {
    this.onEdit.emit(event);
    this.isOpenPlanActions.set(false);
  }

  openAddSession(event: Event) {
    event.stopPropagation();
    this.isOpenPlanActions.set(false);

    this.planService.clearPlanSession();
    const plan = this.plan();
    this.planService.selectedPlanId.set(plan.id);
    this.planService.sessionTitle.set('New Session');
    this.router.navigate([`plan/${plan.id}/session/new`]);
  }

  deletePlan(event: Event) {
    this.onDelete.emit(event);
    this.isOpenPlanActions.set(false);
  }

  detailSession(sessionId: number, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/plan', this.plan().id, 'session', sessionId]);
  }

  onStartSessionClick(sessionId: number, event: Event) {
    event.stopPropagation();
    this.workoutService.startSessionFlow(this.plan().id, sessionId);
  }
}
