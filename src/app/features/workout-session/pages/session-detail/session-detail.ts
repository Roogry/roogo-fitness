import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsis, lucideTrash2, lucidePencil } from '@ng-icons/lucide';
import { WorkoutService } from '@/core/services/workout.service';
import { ExerciseTracker } from '@/features/exercise/components/exercise-tracker/exercise-tracker';
import { HeaderComponent } from '@/shared/components/header/header';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { ZardPopoverComponent, ZardPopoverDirective } from '@/shared/components/zard/popover';

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

  ngOnInit() {
    this.route.queryParamMap.subscribe(async (queryParams) => {
      const planId = queryParams.get('planId');
      const sessionId = queryParams.get('sessionId');

      if (planId && sessionId) {
        await this.workoutService.setSessionFromBlueprint(Number(planId), Number(sessionId));
      }
    });
  }
}
