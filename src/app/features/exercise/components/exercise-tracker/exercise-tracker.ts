import {
  Component,
  computed,
  ElementRef,
  input,
  OnDestroy,
  output,
  signal,
  inject,
  viewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash2, lucidePlus, lucideDumbbell, lucideCheck } from '@ng-icons/lucide';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { LoggedExercise, LoggedSet } from '@/shared/models';
import { VisualViewportService } from '@/core/services/visual-viewport.service';
import {
  KeyboardHelperBar,
  adjustWeight,
  repsChips,
} from '../keyboard-helper-bar/keyboard-helper-bar';

/**
 * A component that tracks an active exercise session, allowing the user to log sets, weight, and reps.
 *
 * This component is stateless regarding persistence: in editable mode it only emits events.
 * The parent page decides where the edits are applied (e.g. the active session service
 * or a local copy of a logged session being edited).
 *
 * @property {LoggedExercise} trackedExercise - The specific exercise instance currently being tracked.
 * @property {boolean} editable - Whether the tracker inputs can be modified.
 * @property {number} [exerciseIndex] - The 1-based index of this exercise in the workout.
 * @property {number} [totalExercises] - The total number of exercises in the workout.
 * @property {{ exerciseId: number; weight: number; reps: number }} addSetSubmitted - Emitted when a new set is submitted.
 * @property {{ exerciseId: number; setId: number; updates: Partial<LoggedSet> }} setUpdated - Emitted when a set value changes.
 * @property {{ exerciseId: number; setId: number }} setRemoved - Emitted when a set is removed.
 * @property {{ exerciseId: number }} exerciseRemoved - Emitted when the whole exercise is removed.
 */
@Component({
  selector: 'app-exercise-tracker',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgIcon,
    ZardCardComponent,
    ZardButtonComponent,
    KeyboardHelperBar,
  ],
  providers: [provideIcons({ lucideTrash2, lucidePlus, lucideDumbbell, lucideCheck })],
  templateUrl: './exercise-tracker.html',
  styleUrl: './exercise-tracker.css',
})
export class ExerciseTracker implements OnDestroy {
  // The exercise data passed from the parent
  trackedExercise = input.required<LoggedExercise>();
  editable = input<boolean>(false);
  exerciseIndex = input<number>();
  totalExercises = input<number>();

  // Events emitted to the parent, which owns the data updates
  readonly addSetSubmitted = output<{ exerciseId: number; weight: number; reps: number }>();
  readonly setUpdated = output<{
    exerciseId: number;
    setId: number;
    updates: Partial<LoggedSet>;
  }>();
  readonly setRemoved = output<{ exerciseId: number; setId: number }>();
  readonly exerciseRemoved = output<{ exerciseId: number }>();

  // Track set IDs that failed validation when marking as done
  readonly invalidSetIds = signal<Set<number>>(new Set());

  /** Reps inputs for each editable set, used to move focus from weight on Enter/Next. */
  private readonly repsInputs = viewChildren<ElementRef<HTMLInputElement>>('repsInput');

  private readonly viewport = inject(VisualViewportService);
  readonly keyboardOffset = this.viewport.keyboardOffset;

  /** Currently focused input (drives the keyboard helper bar). */
  readonly focusedField = signal<{
    setId: number;
    field: 'weight' | 'reps';
    el: HTMLInputElement;
  } | null>(null);
  /** Bumped on every value change so computed chip highlighting re-evaluates. */
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

  /** Applies a helper bar tap through the normal input handlers. */
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

  /**
   * Computes the formatted target summary line shown below the exercise title
   * using the plan-level targets from WorkoutPlanExercise.
   * e.g. "target 80 kg × 8 · 3 sets".
   * Returns null when the session was not started from a plan.
   */
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

  /**
   * Returns the label to display in the set badge:
   * 'W' for warmup sets, or the 1-based sequential working set number.
   */
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

  /**
   * Returns the weight value to display in the input, pre-filling with target_weight.
   */
  getWeightValue(set: LoggedSet): string | number {
    return set.weight_lifted !== undefined && set.weight_lifted !== null
      ? set.weight_lifted
      : (set.target_weight ?? '');
  }

  /**
   * Returns the reps value to display in the input, pre-filling with target_reps.
   */
  getRepsValue(set: LoggedSet): string | number {
    return set.reps_completed !== undefined && set.reps_completed !== null
      ? set.reps_completed
      : (set.target_reps ?? '');
  }

  /**
   * Resolves the effective weight (explicit weight_lifted or fallback target_weight).
   */
  getEffectiveWeight(set: LoggedSet): number | undefined {
    return set.weight_lifted !== undefined && set.weight_lifted !== null
      ? set.weight_lifted
      : set.target_weight;
  }

  /**
   * Resolves the effective reps (explicit reps_completed or fallback target_reps).
   */
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

  /**
   * Handles user editing the weight value.
   */
  onWeightInput(set: LoggedSet, event: Event) {
    const val = (event.target as HTMLInputElement).value;
    const num = val === '' ? undefined : parseFloat(val);
    this.clearValidationError(set.id);
    this.updateSet(set.id, { weight_lifted: num });
    this.valueTick.update((v) => v + 1);
  }

  /**
   * Handles user editing the reps value.
   */
  onRepsInput(set: LoggedSet, event: Event) {
    const val = (event.target as HTMLInputElement).value;
    const num = val === '' ? undefined : parseInt(val, 10);
    this.clearValidationError(set.id);
    this.updateSet(set.id, { reps_completed: num });
    this.valueTick.update((v) => v + 1);
  }

  /**
   * Adds a new set quickly, duplicating the last set's weight & reps or targets.
   */
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

  /**
   * Notifies the parent that an existing logged set should be updated.
   */
  updateSet(setId: number, updates: Partial<LoggedSet>) {
    this.setUpdated.emit({ exerciseId: this.trackedExercise().exercise.id, setId, updates });
  }

  /**
   * Notifies the parent that a set should be removed.
   */
  removeSet(setId: number) {
    this.clearValidationError(setId);
    this.setRemoved.emit({ exerciseId: this.trackedExercise().exercise.id, setId });
  }

  /**
   * Toggles the warmup state for a set.
   */
  toggleWarmup(set: LoggedSet) {
    const newVal = !set.is_warmup;
    this.setUpdated.emit({
      exerciseId: this.trackedExercise().exercise.id,
      setId: set.id,
      updates: { is_warmup: newVal },
    });
  }

  /**
   * Toggles the completed status of a set with validation for weight and reps.
   */
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

    // Validation: Require weight and reps to be provided and > 0
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

  onlyPositiveNumber(event: KeyboardEvent) {
    if (['-', 'e', 'E', '+', '.'].includes(event.key)) {
      event.preventDefault();
    }
  }
}
