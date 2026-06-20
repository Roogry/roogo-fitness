import { ExerciseService } from '@/core/services/exercise.service';
import { Exercise } from '@/shared/models';
import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsis, lucideTrash2, lucidePencil } from '@ng-icons/lucide';
import { WorkoutService } from '@/core/services/workout.service';
import { PlanService } from '@/core/services/plan.service';
import { PlanExerciseCardComponent } from '@/features/plan/components/plan-exercise-card/plan-exercise-card';
import { HeaderComponent } from '@/shared/components/header/header.component';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { ZardPopoverComponent, ZardPopoverDirective } from '@/shared/components/zard/popover';
import { ZardDialogService } from '@/shared/components/zard/dialog';

@Component({
  selector: 'app-session-detail',
  standalone: true,
  imports: [
    CommonModule,
    PlanExerciseCardComponent,
    HeaderComponent,
    ZardButtonComponent,
    ZardPopoverComponent,
    ZardPopoverDirective,
    NgIcon,
    RouterLink,
  ],
  providers: [
    provideIcons({
      lucideEllipsis,
      lucideTrash2,
      lucidePencil,
    }),
  ],
  templateUrl: './plan-session-detail.html',
})
export class PlanSessionDetail implements OnInit {
  workoutService = inject(WorkoutService);
  planService = inject(PlanService);
  exerciseService = inject(ExerciseService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  dialogService = inject(ZardDialogService);

  planId: number | null = null;
  sessionId: number | null = null;
  exercisesMap = signal<Map<number, Exercise>>(new Map());

  constructor() {
    effect(async () => {
      const plannedList = this.planService.plannedExercises();
      const ids = plannedList.map((pe) => pe.exercise_id);
      const res = await this.exerciseService.loadExercisesToMap(ids, this.exercisesMap());
      if (res.changed) {
        this.exercisesMap.set(res.map);
      }
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      const planIdParam = params.get('id');
      const sessionIdParam = params.get('sessionId');

      if (planIdParam && sessionIdParam) {
        this.planId = Number(planIdParam);
        this.sessionId = Number(sessionIdParam);
        await this.planService.setSessionFromPlan(this.planId, this.sessionId);
      }
    });
  }

  onDeleteSessionClick() {
    if (this.planId === null || this.sessionId === null) return;

    this.dialogService.create({
      zWidth: '400px',
      zTitle: 'Delete Session?',
      zDescription: 'Are you sure you want to delete this session? This action cannot be undone.',
      zOkText: 'Delete',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zOnOk: async () => {
        await this.planService.deleteSessionFromPlan(this.planId!, this.sessionId!);
        this.router.navigate(['/plan']);
      },
    });
  }

  onStartSessionClick(event: Event) {
    event.stopPropagation();
    this.workoutService.startSessionFlow(this.planId, this.sessionId);
  }
}
