import { Component, inject, OnInit } from '@angular/core';
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
  templateUrl: './session-detail.html',
})
export class SessionDetail implements OnInit {
  workoutService = inject(WorkoutService);
  planService = inject(PlanService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  dialogService = inject(ZardDialogService);

  planId: number | null = null;
  sessionId: number | null = null;

  ngOnInit() {
    this.route.queryParamMap.subscribe(async (queryParams) => {
      const planIdParam = queryParams.get('planId');
      const sessionIdParam = queryParams.get('sessionId');

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
    if (this.workoutService.sessionStartTime()) {
      this.dialogService.create({
        zTitle: 'Active Workout Session',
        zDescription:
          'You already have an active workout session running. Are you sure you want to start a new workout?',
        zOkText: 'Start New',
        zOkDestructive: true,
        zCancelText: 'Cancel',
        zOnOk: () => {
          this.workoutService.clearSession();
          this.router.navigate(['/session/active'], {
            queryParams: { planId: this.planId, sessionId: this.sessionId },
          });
        },
      });
    } else {
      this.router.navigate(['/session/active'], {
        queryParams: { planId: this.planId, sessionId: this.sessionId },
      });
    }
  }
}
