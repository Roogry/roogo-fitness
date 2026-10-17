import { FloatingBlurComponent } from '@/shared/components/floating-blur/floating-blur';
import { VisualViewportService } from '@/core/services/visual-viewport.service';
import { Component, ElementRef, OnInit, afterNextRender, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideDumbbell, lucidePlus } from '@ng-icons/lucide';
import { ExerciseService } from '@/core/services/exercise.service';
import { WorkoutService } from '@/core/services/workout.service';
import { ReplaceExercisePicker } from '@/features/session-active/components/replace-exercise-picker/replace-exercise-picker';
import {
  completedSetCount,
  deleteLoggedSetsMessage,
  loggedSetsConfirmOptions,
  replaceLoggedSetsMessage,
} from '@/features/session-active/logged-sets-confirm';
import { sortReplacementCandidates } from '@/features/session-active/replace-exercise';
import { Exercise, LoggedExercise, LoggedSet } from '@/shared/models';
import { SwipeActionsGroup } from '@/shared/directives/swipe-actions';
import { ExerciseAutocomplete } from '@/features/exercise/components/exercise-autocomplete/exercise-autocomplete';
import { ExerciseTracker } from '@/features/exercise/components/exercise-tracker/exercise-tracker';
import { HeaderComponent } from '@/shared/components/header/header.component';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { RooSheetComponent } from '@/shared/components/sheet/sheet';
import { ZardDialogService } from '@/shared/components/zard/dialog';
import { ActiveSessionFinishSheet } from '../../components/active-session-finish-sheet/active-session-finish-sheet';
import { RestTimerBar } from '../../components/rest-timer-bar/rest-timer-bar';
import { DismissKeyboardOnScroll } from '@/shared/directives/dismiss-keyboard-on-scroll.directive';
import { timeFormatPipe } from '@/shared/pipes/time-format-pipe';

@Component({
  selector: 'app-session-active',
  standalone: true,
  imports: [
    FloatingBlurComponent,
    CommonModule,
    ExerciseAutocomplete,
    ExerciseTracker,
    ReplaceExercisePicker,
    HeaderComponent,
    ZardButtonComponent,
    RooSheetComponent,
    timeFormatPipe,
    NgIcon,
    ActiveSessionFinishSheet,
    RestTimerBar,
    DismissKeyboardOnScroll,
  ],
  providers: [
    SwipeActionsGroup,
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
  private readonly exerciseService = inject(ExerciseService);
  private readonly swipeGroup = inject(SwipeActionsGroup);
  router = inject(Router);
  route = inject(ActivatedRoute);
  dialogService = inject(ZardDialogService);

  isAddSheetOpen = signal(false);
  isReplaceSheetOpen = signal(false);
  replaceCandidates = signal<Exercise[]>([]);
  private readonly replacingExerciseId = signal<number | null>(null);
  isFinishSheetOpen = signal(false);
  progressedExercises = signal<any[]>([]);
  /** Bottom-bar Duration control swaps to the session start time until tapped again. */
  showStartTime = signal(false);

  private readonly host = inject(ElementRef<HTMLElement>);
  /** Hides the bottom session bar + rest timer while the keyboard is open so they don't overlap the input helper (#75). */
  readonly viewport = inject(VisualViewportService);
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

  onExerciseRemove(event: { exerciseId: number }) {
    const tracked = this.workoutService
      .trackedExercises()
      .find((item) => item.exercise.id === event.exerciseId);
    if (!tracked) return;

    const completed = completedSetCount(tracked.sets);
    if (completed === 0) {
      this.deleteTrackedExercise(event.exerciseId);
      return;
    }

    // Swipe, long-press, and the desktop menu all emit this. Close on cancel so the row
    // does not stay open, and close as the dialog opens because Escape and the backdrop
    // dismiss it without running the cancel callback.
    this.swipeGroup.closeAll();
    this.dialogService.create(
      loggedSetsConfirmOptions({
        title: 'Delete exercise?',
        description: deleteLoggedSetsMessage(completed),
        okText: 'Delete',
        destructive: true,
        onOk: () => this.deleteTrackedExercise(event.exerciseId),
        onCancel: () => this.swipeGroup.closeAll(),
      }),
    );
  }

  onExerciseReplace(event: { exerciseId: number }): Promise<void> | void {
    const tracked = this.workoutService
      .trackedExercises()
      .find((item) => item.exercise.id === event.exerciseId);
    if (!tracked) return;

    this.swipeGroup.closeAll();

    const completed = completedSetCount(tracked.sets);
    if (completed === 0) {
      return this.openReplacePicker(tracked);
    }

    this.dialogService.create(
      loggedSetsConfirmOptions({
        title: 'Replace exercise?',
        description: replaceLoggedSetsMessage(completed),
        okText: 'Continue',
        onOk: () => {
          void this.openReplacePicker(tracked);
        },
      }),
    );
  }

  private deleteTrackedExercise(exerciseId: number) {
    this.swipeGroup.closeAll();
    this.workoutService.removeTrackedExercise(exerciseId);
  }

  onReplaceSheetOpenChange(isOpen: boolean) {
    this.isReplaceSheetOpen.set(isOpen);
    if (!isOpen) this.replacingExerciseId.set(null);
  }

  async onReplacementPicked(exercise: Exercise) {
    const currentId = this.replacingExerciseId();
    if (currentId === null) return;

    const savedTargets = await this.workoutService.savedTargetsForExercise(exercise.id);
    const didReplace = this.workoutService.replaceTrackedExercise(
      currentId,
      exercise,
      savedTargets,
    );
    if (!didReplace) return;

    this.isReplaceSheetOpen.set(false);
    this.replacingExerciseId.set(null);
  }

  private async openReplacePicker(tracked: LoggedExercise) {
    this.replacingExerciseId.set(tracked.exercise.id);
    const catalog = await this.exerciseService.getExercises('');
    const excludedIds = new Set(
      this.workoutService.trackedExercises().map((item) => item.exercise.id),
    );
    this.replaceCandidates.set(sortReplacementCandidates(catalog, tracked.exercise, excludedIds));
    this.isReplaceSheetOpen.set(true);
  }

  onDurationClick() {
    this.showStartTime.update((showing) => !showing);
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
