import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutPlan, WorkoutPlanSession } from '@/shared/models/workout.model';
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
import { Router } from '@angular/router';
import { ZardDialogService } from '@/shared/components/zard/dialog';

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
export class PlanCardComponent {
  @Input({ required: true }) plan!: WorkoutPlan;
  @Input() isExpanded = false;

  @Output() onToggle = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<Event>();
  @Output() onDelete = new EventEmitter<Event>();

  router = inject(Router);
  workoutService = inject(WorkoutService);
  planService = inject(PlanService);
  dialogService = inject(ZardDialogService);
  isOpenPlanActions = signal(false);

  getExerciseNames(session: WorkoutPlanSession): string {
    if (!session.exercises || session.exercises.length === 0) {
      return 'No exercises added yet.';
    }
    return session.exercises.map((pe) => pe.exercise.name).join(', ');
  }

  handleToggle() {
    this.onToggle.emit();
  }

  openPlanActionsSheet(event: Event) {
    event.stopPropagation();
    this.planService.selectedPlanId.set(this.plan.id);
  }

  editPlan(event: Event) {
    this.onEdit.emit(event);
    this.isOpenPlanActions.set(false);
  }

  openAddSession(event: Event) {
    event.stopPropagation();
    this.isOpenPlanActions.set(false);

    this.planService.clearPlanSession();
    this.planService.selectedPlanId.set(this.plan.id);
    this.planService.sessionTitle.set('New Session');
    this.router.navigate([`plan/${this.plan.id}/session/create`]);
  }

  deletePlan(event: Event) {
    this.onDelete.emit(event);
    this.isOpenPlanActions.set(false);
  }

  detailSession(sessionId: number, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/session/detail'], { queryParams: { planId: this.plan.id, sessionId } });
  }

  startSession(sessionId: number, event: Event) {
    event.stopPropagation();
    if (this.workoutService.sessionStartTime()) {
      this.dialogService.create({
        zTitle: 'Active Workout Session',
        zDescription: 'You already have an active workout session running.',
        zContent:
          'Are you sure you want to start a new workout? This will permanently delete your current active session data.',
        zOkText: 'Start New',
        zOkDestructive: true,
        zCancelText: 'Cancel',
        zOnOk: () => {
          this.workoutService.clearSession();
          this.router.navigate(['/session/active'], {
            queryParams: { planId: this.plan.id, sessionId },
          });
        },
      });
    } else {
      this.router.navigate(['/session/active'], {
        queryParams: { planId: this.plan.id, sessionId },
      });
    }
  }
}
