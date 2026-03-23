import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutPlan, WorkoutPlanSession } from '@/shared/types/workout.types';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardPopoverComponent, ZardPopoverDirective } from '@/shared/components/popover';

import {
  LucideAngularModule,
  Plus,
  Dumbbell,
  EllipsisVertical,
  ChevronRight,
  Pencil,
  Trash2,
} from 'lucide-angular';
import { WorkoutService } from '@/shared/services/workout.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-plan-card',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardPopoverComponent,
    ZardPopoverDirective,
    LucideAngularModule,
  ],
  templateUrl: './plan-card.html',
})
export class PlanCardComponent {
  readonly Plus = Plus;
  readonly Dumbbell = Dumbbell;
  readonly EllipsisVertical = EllipsisVertical;
  readonly ChevronRight = ChevronRight;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;

  @Input({ required: true }) plan!: WorkoutPlan;
  @Input() isExpanded = false;

  @Output() onToggle = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<Event>();
  @Output() onDelete = new EventEmitter<Event>();

  router = inject(Router);
  workoutService = inject(WorkoutService);
  isOpenPlanActions = signal(false);


  getExerciseNames(session: WorkoutPlanSession): string {
    if (!session.exercises || session.exercises.length === 0) {
      return 'No exercises added yet.';
    }
    return session.exercises.map(pe => pe.exercise.name).join(', ');
  }

  handleToggle() {
    this.onToggle.emit();
  }

  openPlanActionsSheet(event: Event) {
    event.stopPropagation();
    this.workoutService.selectedPlanId.set(this.plan.id);
  }

  editPlan(event: Event) {
    this.onEdit.emit(event);
    this.isOpenPlanActions.set(false);
  }

  openAddSession(event: Event) {
    event.stopPropagation();
    this.isOpenPlanActions.set(false);

    this.workoutService.clearSession();
    this.workoutService.selectedPlanId.set(this.plan.id);
    this.workoutService.sessionTitle.set('New Session');
    this.router.navigate(['/blueprint/session/create']);
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
    this.router.navigate(['/session/start'], { queryParams: { planId: this.plan.id, sessionId } });
  }
}
