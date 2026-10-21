import {
  Component,
  computed,
  ElementRef,
  input,
  OnDestroy,
  output,
  signal,
  inject,
  viewChild,
  viewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideTrash2,
  lucidePlus,
  lucideDumbbell,
  lucideCheck,
  lucideEllipsisVertical,
  lucideArrowLeftRight,
} from '@ng-icons/lucide';
import { PointerModeService } from '@/core/services/pointer-mode.service';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { ZardPopoverComponent, ZardPopoverDirective } from '@/shared/components/zard/popover';
import { SwipeActions } from '@/shared/directives/swipe-actions';
import { LoggedExercise, LoggedSet } from '@/shared/models';
import { VisualViewportService } from '@/core/services/visual-viewport.service';
import { KeyboardHelperBar } from '../keyboard-helper-bar/keyboard-helper-bar';
import { adjustWeight, repsChips } from '../keyboard-helper-bar/keyboard-helper-bar.utils';

@Component({
  selector: 'app-exercise-tracker',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgIcon,
    ZardCardComponent,
    ZardButtonComponent,
    ZardPopoverComponent,
    ZardPopoverDirective,
    KeyboardHelperBar,
    SwipeActions,
  ],
  providers: [
    provideIcons({
      lucideTrash2,
      lucidePlus,
      lucideDumbbell,
      lucideCheck,
      lucideEllipsisVertical,
      lucideArrowLeftRight,
    }),
  ],
  templateUrl: './exercise-tracker.html',
  styleUrl: './exercise-tracker.css',
})
export class ExerciseTracker implements OnDestroy {
  trackedExercise = input.required<LoggedExercise>();
  editable = input<boolean>(false);

  sessionActions = input(false);
  exerciseIndex = input<number>();
  totalExercises = input<number>();

  readonly addSetSubmitted = output<{ exerciseId: number; weight: number; reps: number }>();
  readonly setUpdated = output<{
    exerciseId: number;
    setId: number;
    updates: Partial<LoggedSet>;
  }>();
  readonly setRemoved = output<{ exerciseId: number; setId: number }>();
  readonly exerciseRemoved = output<{ exerciseId: number }>();
  readonly exerciseReplace = output<{ exerciseId: number }>();

  readonly invalidSetIds = signal<Set<number>>(new Set());

  /** Reps inputs for each editable set, used to move focus from weight on Enter/Next. */
  private readonly repsInputs = viewChildren<ElementRef<HTMLInputElement>>('repsInput');

  private readonly viewport = inject(VisualViewportService);
  private readonly pointerMode = inject(PointerModeService);
  private readonly router = inject(Router);
  private readonly swipeActions = viewChild(SwipeActions);
  readonly isDesktopPointer = this.pointerMode.isDesktop;
  /** Desktop kebab only. Touch reveals the swipe tray. */
  readonly actionsMenuOpen = signal(false);

  /** Touch session cards reveal actions by swipe. Desktop keeps the visible menu. */
  readonly swipeEnabled = computed(
    () => this.editable() && this.sessionActions() && !this.isDesktopPointer(),
  );
  readonly actionsRevealed = computed(() => this.swipeActions()?.open() ?? false);
  readonly keyboardOffset = this.viewport.keyboardOffset;
  readonly visualBottom = this.viewport.visualBottom;

  /** Currently focused input (drives the keyboard helper bar). */
  readonly focusedField = signal<{
    setId: number;
    field: 'weight' | 'reps';
    el: HTMLInputElement;
  } | null>(null);

  private readonly valueTick = signal(0);

  readonly focusedSet = computed(() => {
    const f = this.focusedField();
    return f ? (this.trackedExercise()?.sets.find((s) => s.id === f.setId) ?? null) : null;
  });

  /** Show when a field is focused, the set isn't done, and a keyboard is open (or on touch). */
  readonly showHelperBar = computed(() => {
    const set = this.focusedSet();
    if (!set || set.completed_at) return false;
    return this.keyboardOffset() > 40 || this.viewport.isTouch;
  });

  readonly helperChips = computed(() => {
    this.valueTick();
    const set = this.focusedSet();
    return set ? repsChips(this.getEffectiveWeight(set)) : [];
  });

  readonly helperCurrent = computed(() => {
    this.valueTick();
    const f = this.focusedField();
    if (!f || f.el.value === '') return undefined;
    const n = Number(f.el.value);
    return isNaN(n) ? undefined : n;
  });

  /** Set once the tracker is destroyed so a queued blur cannot write focus state afterward. */
  private destroyed = false;

  ngOnDestroy() {
    this.destroyed = true;
  }

  onFieldFocus(set: LoggedSet, field: 'weight' | 'reps', event: Event) {
    this.focusedField.set({ setId: set.id, field, el: event.target as HTMLInputElement });
  }

  /**
   * Clear on the next microtask. Moving between the weight and reps inputs fires blur
   * then focus in the same turn; waiting lets the new field replace this one so the
   * helper stays mounted and crossfades instead of replaying leave/enter.
   */
  onFieldBlur() {
    const token = this.focusedField();
    queueMicrotask(() => {
      if (this.destroyed || this.focusedField() !== token) return;
      this.focusedField.set(null);
    });
  }

  onHelperPicked(value: number) {
    const f = this.focusedField();
    const set = this.focusedSet();
    if (!f || !set) return;
    if (f.field === 'weight') {
      f.el.value = String(adjustWeight(f.el.value, set.target_weight, value));
      this.onWeightInput(set, { target: f.el } as unknown as Event);
    } else {
      f.el.value = String(value);
      this.onRepsInput(set, { target: f.el } as unknown as Event);
    }
    this.valueTick.update((v) => v + 1);
  }

  readonly targetSummary = computed(() => {
    const planned = this.trackedExercise()?.plannedExercise;
    if (!planned) return null;

    const weight = planned.target_weight;
    const reps = planned.target_reps;
    const sets = planned.target_sets;
    const setUnit = sets === 1 ? 'set' : 'sets';

    if (weight !== undefined && reps !== undefined && sets !== undefined) {
      return `target ${weight} kg × ${reps} · ${sets} ${setUnit}`;
    }
    if (weight !== undefined && reps !== undefined) {
      return `target ${weight} kg × ${reps}`;
    }
    if (reps !== undefined && sets !== undefined) {
      return `target ${reps} reps · ${sets} ${setUnit}`;
    }
    if (weight !== undefined && sets !== undefined) {
      return `target ${weight} kg · ${sets} ${setUnit}`;
    }
    if (reps !== undefined) return `target ${reps} reps`;
    if (weight !== undefined) return `target ${weight} kg`;
    if (sets !== undefined) return `${sets} ${setUnit}`;
    return null;
  });

  getSetBadgeLabel(targetSet: LoggedSet): string {
    if (targetSet.is_warmup) {
      return 'W';
    }
    const sets = this.trackedExercise()?.sets || [];
    let count = 0;
    for (const s of sets) {
      if (!s.is_warmup) {
        count++;
      }
      if (s.id === targetSet.id) {
        return count.toString();
      }
    }
    return targetSet.set_number?.toString() ?? '1';
  }

  getWeightValue(set: LoggedSet): string | number {
    return set.weight_lifted !== undefined && set.weight_lifted !== null
      ? set.weight_lifted
      : (set.target_weight ?? '');
  }

  getRepsValue(set: LoggedSet): string | number {
    return set.reps_completed !== undefined && set.reps_completed !== null
      ? set.reps_completed
      : (set.target_reps ?? '');
  }

  getEffectiveWeight(set: LoggedSet): number | undefined {
    return set.weight_lifted !== undefined && set.weight_lifted !== null
      ? set.weight_lifted
      : set.target_weight;
  }

  getEffectiveReps(set: LoggedSet): number | undefined {
    return set.reps_completed !== undefined && set.reps_completed !== null
      ? set.reps_completed
      : set.target_reps;
  }

  /**
   * Moves focus from a set's weight field to that same set's reps field.
   * Enter / the mobile keyboard Next key should not submit or validate the set.
   */
  onWeightEnter(set: LoggedSet, event: Event) {
    event.preventDefault();
    const repsInput = this.repsInputs().find(
      (input) => Number(input.nativeElement.dataset['setId']) === set.id,
    );
    repsInput?.nativeElement.focus();
  }

  onWeightInput(set: LoggedSet, event: Event) {
    const val = (event.target as HTMLInputElement).value;
    const num = val === '' ? undefined : parseFloat(val);
    this.clearValidationError(set.id);
    this.updateSet(set.id, { weight_lifted: num });
    this.valueTick.update((v) => v + 1);
  }

  onRepsInput(set: LoggedSet, event: Event) {
    const val = (event.target as HTMLInputElement).value;
    const num = val === '' ? undefined : parseInt(val, 10);
    this.clearValidationError(set.id);
    this.updateSet(set.id, { reps_completed: num });
    this.valueTick.update((v) => v + 1);
  }

  onQuickAddSet() {
    const sets = this.trackedExercise()?.sets || [];
    let weight = 0;
    let reps = 0;

    if (sets.length > 0) {
      const lastSet = sets[sets.length - 1];
      weight = this.getEffectiveWeight(lastSet) ?? 0;
      reps = this.getEffectiveReps(lastSet) ?? 0;
    } else {
      const refSet = this.trackedExercise()?.sets?.[0];
      weight = refSet?.target_weight ?? 0;
      reps = refSet?.target_reps ?? 0;
    }

    this.addSetSubmitted.emit({
      exerciseId: this.trackedExercise().exercise.id,
      weight,
      reps,
    });
  }

  updateSet(setId: number, updates: Partial<LoggedSet>) {
    this.setUpdated.emit({ exerciseId: this.trackedExercise().exercise.id, setId, updates });
  }

  removeSet(setId: number) {
    this.clearValidationError(setId);
    this.setRemoved.emit({ exerciseId: this.trackedExercise().exercise.id, setId });
  }

  toggleWarmup(set: LoggedSet) {
    const newVal = !set.is_warmup;
    this.setUpdated.emit({
      exerciseId: this.trackedExercise().exercise.id,
      setId: set.id,
      updates: { is_warmup: newVal },
    });
  }

  toggleCompleted(set: LoggedSet) {
    const isCompleted = !!set.completed_at;
    if (isCompleted) {
      this.clearValidationError(set.id);
      this.setUpdated.emit({
        exerciseId: this.trackedExercise().exercise.id,
        setId: set.id,
        updates: { completed_at: undefined },
      });
      return;
    }

    const effectiveWeight = this.getEffectiveWeight(set);
    const effectiveReps = this.getEffectiveReps(set);

    const hasValidWeight =
      effectiveWeight !== undefined && !isNaN(effectiveWeight) && effectiveWeight > 0;
    const hasValidReps = effectiveReps !== undefined && !isNaN(effectiveReps) && effectiveReps > 0;

    if (!hasValidWeight || !hasValidReps) {
      this.invalidSetIds.update((setIds) => {
        const next = new Set(setIds);
        next.add(set.id);
        return next;
      });
      return;
    }

    this.clearValidationError(set.id);
    this.setUpdated.emit({
      exerciseId: this.trackedExercise().exercise.id,
      setId: set.id,
      updates: {
        completed_at: new Date().toISOString(),
        weight_lifted: effectiveWeight,
        reps_completed: effectiveReps,
      },
    });
  }

  clearValidationError(setId: number) {
    if (this.invalidSetIds().has(setId)) {
      this.invalidSetIds.update((setIds) => {
        const next = new Set(setIds);
        next.delete(setId);
        return next;
      });
    }
  }

  isSetInvalid(setId: number): boolean {
    return this.invalidSetIds().has(setId);
  }

  removeExercise() {
    this.exerciseRemoved.emit({ exerciseId: this.trackedExercise().exercise.id });
  }

  onExerciseActions() {
    this.swipeActions()?.reveal();
  }

  onExerciseNameClick() {
    void this.router.navigate(['/exercise', this.trackedExercise().exercise.id]);
  }

  onExerciseNameKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    this.onExerciseNameClick();
  }

  onReplaceClick() {
    this.actionsMenuOpen.set(false);
    this.exerciseReplace.emit({ exerciseId: this.trackedExercise().exercise.id });
  }

  onDeleteClick() {
    this.actionsMenuOpen.set(false);
    this.removeExercise();
  }

  onlyPositiveNumber(event: KeyboardEvent) {
    if (['-', 'e', 'E', '+', '.'].includes(event.key)) {
      event.preventDefault();
    }
  }
}
