import { Component, ElementRef, OnInit, afterNextRender, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideDumbbell, lucidePlus } from '@ng-icons/lucide';
import { WorkoutService } from '@/core/services/workout.service';
import { LoggedExercise, LoggedSet } from '@/shared/models';
import { ExerciseAutocomplete } from '@/features/exercise/components/exercise-autocomplete/exercise-autocomplete';
import { ExerciseTracker } from '@/features/exercise/components/exercise-tracker/exercise-tracker';
import { HeaderComponent } from '@/shared/components/header/header.component';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { RooSheetComponent } from '@/shared/components/sheet/sheet';
import { ZardDialogService } from '@/shared/components/zard/dialog';
import { ActiveSessionFinishSheet } from '../../components/active-session-finish-sheet/active-session-finish-sheet';
import { RestTimerBar } from '../../components/rest-timer-bar/rest-timer-bar';
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
    RestTimerBar,
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

  private readonly host = inject(ElementRef<HTMLElement>);
  /** Set after the enter-page scroll attempt so later set toggles do not move the viewport. */
  private resumeScrollHandled = false;

  constructor() {
    // Once per visit, after the exercise list has been rendered.
    afterNextRender({
      mixedReadWrite: () => {
        this.scrollToLastCompletedExercise();
      },
    });
  }

  ngOnInit() {
    this.setupSessionData();
    // Fix #61: refresh stale exercise data when returning to session
    if (this.workoutService.trackedExercises().length > 0) {
      this.workoutService.refreshTrackedExercises();
    }
  }

  /**
   * Brings the last exercise that already has a checked set into view.
   * Stays put when the session is not running or no set has `completed_at`.
   */
  private scrollToLastCompletedExercise(): void {
    if (this.resumeScrollHandled) {
      return;
    }
    this.resumeScrollHandled = true;

    if (!this.workoutService.sessionStartTime()) {
      return;
    }

    const exerciseId = lastExerciseIdWithCompletedSet(this.workoutService.trackedExercises());
    if (exerciseId === null) {
      return;
    }

    const target = this.host.nativeElement.querySelector(`[data-exercise-id="${exerciseId}"]`);
    if (!(target instanceof HTMLElement)) {
      return;
    }

    target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
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
    // Rest timer auto-start on completed
    if (e.updates.completed_at) {
      const tracked = this.workoutService
        .trackedExercises()
        .find((t) => t.exercise.id === e.exerciseId);
      let restSec = 60;
      if (tracked?.sets && tracked.sets.length > 0) {
        const first = tracked.sets[0] as any;
        restSec = first.rest_time_taken_sec ?? first.target_rest_time ?? 60;
      }
      if (restSec > 0) this.workoutService.startRestTimer(restSec);
    }
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

/**
 * Highest-index exercise that has at least one set with `completed_at`.
 * List order is the session order, so the last match is where logging left off.
 */
export function lastExerciseIdWithCompletedSet(
  exercises: readonly LoggedExercise[],
): number | null {
  for (let index = exercises.length - 1; index >= 0; index--) {
    const tracked = exercises[index];
    if (tracked.sets.some((set) => !!set.completed_at)) {
      return tracked.exercise.id;
    }
  }
  return null;
}
