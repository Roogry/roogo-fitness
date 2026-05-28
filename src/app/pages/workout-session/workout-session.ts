import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideDumbbell,
  lucidePlus,
  lucideCheck,
  lucideEllipsis,
  lucideTrash2,
  lucidePencil,
} from '@ng-icons/lucide';
import { WorkoutService } from '@/shared/services/workout.service';
import { ExerciseAutocomplete } from '@/components/exercise-autocomplete/exercise-autocomplete';
import { ExerciseTracker } from '@/components/exercise-tracker/exercise-tracker';
import { HeaderComponent } from '@/shared/components/header/header';
import { ZardButtonComponent } from '@/shared/components/button';
import { RooSheetComponent } from '@/shared/components/sheet/sheet';
import { DurationFormatPipe } from '@/shared/pipes/duration-format-pipe';
import { ZardInputDirective } from '@/shared/components/input';
import { SessionAction } from '@/shared/types/workout.types';
import { ZardPopoverComponent, ZardPopoverDirective } from '@/shared/components/popover';

@Component({
  selector: 'app-workout-session',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ExerciseAutocomplete,
    ExerciseTracker,
    HeaderComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardPopoverComponent,
    ZardPopoverDirective,
    RooSheetComponent,
    DurationFormatPipe,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideDumbbell,
      lucidePlus,
      lucideCheck,
      lucideEllipsis,
      lucideTrash2,
      lucidePencil,
    }),
  ],
  templateUrl: './workout-session.html',
  styleUrl: './workout-session.css',
})
export class WorkoutSession implements OnInit {
  workoutService = inject(WorkoutService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  // State
  isAddSheetOpen = signal(false);
  sessionAction = signal<SessionAction>('empty');
  headerTitle = signal<string>('Log Session');

  ngOnInit() {
    this.route.queryParamMap.subscribe(async (queryParams) => {
      const planId = queryParams.get('planId');
      const sessionId = queryParams.get('sessionId');

      if (planId && sessionId) {
        await this.workoutService.setSessionFromBlueprint(Number(planId), Number(sessionId));
      }
    });

    this.route.paramMap.subscribe(async (params) => {
      this.sessionAction.set(params.get('action') as SessionAction);

      if (this.sessionAction() === 'detail') {
        this.headerTitle.set('Workout Session');
      }

      if (this.sessionAction() === 'start' || this.sessionAction() === 'empty') {
        this.workoutService.clearSession();
      }

      if (this.sessionAction() === 'empty') {
        this.workoutService.sessionTitle.set('Workout Session');
      }
    });
  }

  onExerciseSelected(exercise: any) {
    this.workoutService.addTrackedExercise(exercise);
    this.isAddSheetOpen.set(false);

    if (!this.workoutService.sessionStartTime()) {
      this.workoutService.startSessionTimer();
    }
  }

  async finishSession() {
    await this.workoutService.finishSession();
    this.router.navigate(['/journey']);
  }
}
