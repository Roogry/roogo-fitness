import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDumbbell, lucidePlus, lucideCheck } from '@ng-icons/lucide';
import { WorkoutService } from '@/core/services/workout.service';
import { LoggedSet } from '@/shared/models';
import { ExerciseAutocomplete } from '@/features/exercise/components/exercise-autocomplete/exercise-autocomplete';
import { ExerciseTracker } from '@/features/exercise/components/exercise-tracker/exercise-tracker';
import { HeaderComponent } from '@/shared/components/header/header.component';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { RooSheetComponent } from '@/shared/components/sheet/sheet';
import { ZardDialogService } from '@/shared/components/zard/dialog';
import { ActiveSessionFinishSheet } from '../../components/active-session-finish-sheet/active-session-finish-sheet';
import { timeFormatPipe } from '@/shared/pipes/time-format-pipe';

@Component({
  selector: 'app-session-active',
  standalone: true,
  imports: [
    CommonModule,
    ExerciseAutocomplete,
    ExerciseTracker,
    HeaderComponent,
    ZardButtonComponent,
    RooSheetComponent,
    timeFormatPipe,
    NgIcon,
    ActiveSessionFinishSheet,
  ],
  providers: [
    provideIcons({
      lucideDumbbell,
      lucidePlus,
      lucideCheck,
    }),
  ],
  templateUrl: './session-active.html',
})
export class SessionActive implements OnInit {
  workoutService = inject(WorkoutService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  dialogService = inject(ZardDialogService);

  isAddSheetOpen = signal(false);
  isFinishSheetOpen = signal(false);
  progressedExercises = signal<any[]>([]);

  ngOnInit() {
    this.setupSessionData();
    // Fix #61: refresh stale exercise data when returning to session
    if (this.workoutService.trackedExercises().length > 0) {
      this.workoutService.refreshTrackedExercises();
    }
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
    });
  }

  onExerciseSelected(exercise: any) {
    this.workoutService.addTrackedExercise(exercise);
    this.isAddSheetOpen.set(false);

    if (!this.workoutService.sessionStartTime()) {
      this.workoutService.startSessionTimer();
    }
  }

  onAddSet(e: { exerciseId: number; weight: number; reps: number }) {
    this.workoutService.addSet(e.exerciseId, e.weight, e.reps);
  }

  onSetUpdate(e: { exerciseId: number; setId: number; updates: Partial<LoggedSet> }) {
    this.workoutService.updateSet(e.exerciseId, e.setId, e.updates);
  }

  onSetRemove(e: { exerciseId: number; setId: number }) {
    this.workoutService.removeSet(e.exerciseId, e.setId);
  }

  onExerciseRemove(e: { exerciseId: number }) {
    this.workoutService.removeTrackedExercise(e.exerciseId);
  }

  openFinishSheet() {
    const progressions: any[] = [];

    for (const tracked of this.workoutService.trackedExercises()) {
      let targetWeight = 0;
      let targetReps = 0;
      const completedSets: { weight: number; reps: number; volume: number; exceeded: boolean }[] =
        [];

      for (const s of tracked.sets) {
        const actualWeight = s.weight_lifted ?? 0;
        const actualReps = s.reps_completed ?? 0;

        if (actualWeight > 0 && actualReps > 0) {
          const tWeight = s.target_weight ?? 0;
          const tReps = s.target_reps ?? 0;

          targetWeight = tWeight;
          targetReps = tReps;

          const exceeded = actualWeight > tWeight || actualReps > tReps;
          completedSets.push({
            weight: actualWeight,
            reps: actualReps,
            volume: actualWeight * actualReps,
            exceeded,
          });
        }
      }

      const exceedingSets = completedSets.filter((s) => s.exceeded);

      if (exceedingSets.length > 0) {
        // Sort by volume descending, then by weight descending
        exceedingSets.sort((a, b) => {
          if (b.volume !== a.volume) {
            return b.volume - a.volume;
          }
          return b.weight - a.weight;
        });

        const bestSet = exceedingSets[0];

        progressions.push({
          exerciseId: tracked.exercise.id,
          exerciseName: tracked.exercise.name,
          oldWeight: targetWeight,
          oldReps: targetReps,
          newWeight: bestSet.weight,
          newReps: bestSet.reps,
          shouldUpdateTarget: true,
        });
      }
    }

    this.progressedExercises.set(progressions);
    this.isFinishSheetOpen.set(true);
  }

  openDiscardConfirm() {
    this.dialogService.create({
      zWidth: '400px',
      zTitle: 'Discard Session?',
      zDescription:
        'Are you sure you want to discard this session? All progress will be lost and cannot be recovered.',
      zOkText: 'Discard',
      zOkDestructive: true,
      zCancelText: 'Cancel',
      zOnOk: () => {
        this.workoutService.clearSession();
        this.router.navigate(['/']);
      },
    });
  }
}
