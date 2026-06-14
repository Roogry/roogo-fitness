import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDumbbell, lucidePlus, lucideCheck } from '@ng-icons/lucide';
import { WorkoutService } from '@/core/services/workout.service';
import { ExerciseAutocomplete } from '@/features/exercise/components/exercise-autocomplete/exercise-autocomplete';
import { ExerciseTracker } from '@/features/exercise/components/exercise-tracker/exercise-tracker';
import { HeaderComponent } from '@/shared/components/header/header.component';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { RooSheetComponent } from '@/shared/components/sheet/sheet';
import { DurationFormatPipe } from '@/shared/pipes/duration-format-pipe';
import { ZardInputDirective } from '@/shared/components/zard/input';
import { ZardDialogService } from '@/shared/components/zard/dialog';
import { form, FormField, required } from '@angular/forms/signals';
import { ZardFormImports } from '@/shared/components/zard/form';

@Component({
  selector: 'app-session-active',
  standalone: true,
  imports: [
    CommonModule,
    ExerciseAutocomplete,
    ExerciseTracker,
    HeaderComponent,
    ZardButtonComponent,
    ZardInputDirective,
    RooSheetComponent,
    DurationFormatPipe,
    NgIcon,
    FormField,
    ZardFormImports,
  ],
  providers: [
    provideIcons({
      lucideDumbbell,
      lucidePlus,
      lucideCheck,
    }),
  ],
  templateUrl: './session-active.html',
  styleUrl: './session-active.css',
})
export class SessionActive implements OnInit {
  workoutService = inject(WorkoutService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  dialogService = inject(ZardDialogService);

  isAddSheetOpen = signal(false);
  isFinishSheetOpen = signal(false);
  titleModel = signal({
    title: '',
    note: '',
  });

  titleForm = form(this.titleModel, (f) => {
    required(f.title, { message: 'Session title is required' });
  });

  ngOnInit() {
    this.setupSessionData();
  }

  setupSessionData() {
    this.route.queryParamMap.subscribe(async (queryParams) => {
      const planId = queryParams.get('planId');
      const sessionId = queryParams.get('sessionId');
      const autoStart = queryParams.get('autoStart') === 'true';

      const isSessionAlreadyRunning = !!this.workoutService.sessionStartTime();

      if (planId && sessionId) {
        if (!isSessionAlreadyRunning || this.workoutService.selectedPlanId() !== Number(planId)) {
          await this.workoutService.setupSessionFromPlan(Number(planId), Number(sessionId));

          if (autoStart && !this.workoutService.sessionStartTime()) {
            this.workoutService.startSessionTimer();
          }
        }
      } else if (!isSessionAlreadyRunning) {
        this.workoutService.clearSession();
        this.workoutService.sessionTitle.set('Workout Session');
      }

      this.titleModel.set({
        title: this.workoutService.sessionTitle(),
        note: this.titleModel().note || '',
      });
      this.titleForm().reset();
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
    this.isFinishSheetOpen.set(false);

    const title = this.titleModel().title;
    const note = this.titleModel().note;
    await this.workoutService.finishSession(title, note);

    this.router.navigate(['/journey'], { queryParams: { tab: 'history' } });
  }

  openDiscardConfirm() {
    this.dialogService.create({
      zWidth: '400px',
      zTitle: 'Discard Session?',
      zDescription: 'Are you sure you want to discard this session? All progress will be lost and cannot be recovered.',
      zOkText: 'Discard',
      zOkDestructive: true,
      zCancelText: 'Cancel',
      zOnOk: () => {
        this.workoutService.clearSession();
        this.router.navigate(['/']);
      }
    });
  }
}
