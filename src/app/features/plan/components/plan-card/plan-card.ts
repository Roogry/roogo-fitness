import { Component, inject, signal, OnInit, input, output, computed } from '@angular/core';
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
import { skippedPlanExerciseNoteFor, splitPlanExercises } from '@/core/utils/plan-exercise.utils';

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
  private readonly exercisesReady = signal(false);
  readonly skippedExerciseNotes = computed(() => {
    const notes = new Map<number, string>();
    if (!this.exercisesReady()) return notes;

    const catalog = this.exerciseMap();
    for (const session of this.plan().sessions) {
      const planned = session.exercises ?? [];
      const checked = new Set(planned.map((plannedExercise) => plannedExercise.exercise_id));
      const note = skippedPlanExerciseNoteFor(planned, catalog, checked);
      if (note) notes.set(session.id, note);
    }
    return notes;
  });

  async ngOnInit() {
    const exercises = await this.exerciseService.getExercises('');
    const map = new Map<number, Exercise>();
    for (const exercise of exercises) {
      map.set(exercise.id, exercise);
    }
    this.exerciseMap.set(map);
    this.exercisesReady.set(true);
  }

  getExerciseNames(session: WorkoutPlanSession): string {
    const planned = (session.exercises ?? []).filter(
      (plannedExercise) =>
        plannedExercise &&
        plannedExercise.exercise_id !== undefined &&
        plannedExercise.exercise_id !== null,
    );
    if (planned.length === 0) return 'No exercises added yet.';
    if (!this.exercisesReady()) {
      return planned
        .map((plannedExercise) => `Exercise #${plannedExercise.exercise_id}`)
        .join(', ');
    }

    const catalog = this.exerciseMap();
    const found = splitPlanExercises(planned, catalog).found;
    if (found.length === 0) return '';

    return found
      .map((plannedExercise) => catalog.get(plannedExercise.exercise_id)?.name ?? '')
      .filter((name) => name.length > 0)
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
