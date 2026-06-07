import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsis, lucideTrash2, lucidePencil } from '@ng-icons/lucide';
import { WorkoutService } from '@/core/services/workout.service';
import { ExerciseTracker } from '@/features/exercise/components/exercise-tracker/exercise-tracker';
import { HeaderComponent } from '@/shared/components/header/header';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { ZardPopoverComponent, ZardPopoverDirective } from '@/shared/components/zard/popover';
import { ZardDialogService } from '@/shared/components/zard/dialog';

@Component({
  selector: 'app-session-detail',
  standalone: true,
  imports: [
    CommonModule,
    ExerciseTracker,
    HeaderComponent,
    ZardButtonComponent,
    ZardPopoverComponent,
    ZardPopoverDirective,
    NgIcon,
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
        await this.workoutService.setSessionFromBlueprint(this.planId, this.sessionId);
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
        await this.workoutService.deleteSessionFromBlueprint(this.planId!, this.sessionId!);
        this.router.navigate(['/blueprint']);
      },
    });
  }
}
