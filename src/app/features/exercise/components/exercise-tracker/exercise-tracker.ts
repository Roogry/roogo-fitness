import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash2, lucidePlus, lucideDumbbell, lucideCheck } from '@ng-icons/lucide';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { LoggedExercise, LoggedSet } from '@/shared/models';

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
  ],
  providers: [provideIcons({ lucideTrash2, lucidePlus, lucideDumbbell, lucideCheck })],
  templateUrl: './exercise-tracker.html',
  styleUrl: './exercise-tracker.css',
})
export class ExerciseTracker {
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
      : set.target_weight ?? '';
  }

  /**
   * Returns the reps value to display in the input, pre-filling with target_reps.
   */
  getRepsValue(set: LoggedSet): string | number {
    return set.reps_completed !== undefined && set.reps_completed !== null
      ? set.reps_completed
      : set.target_reps ?? '';
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
   * Handles user editing the weight value.
   */
  onWeightInput(set: LoggedSet, event: Event) {
    const val = (event.target as HTMLInputElement).value;
    const num = val === '' ? undefined : parseFloat(val);
    this.clearValidationError(set.id);
    this.updateSet(set.id, { weight_lifted: num });
  }

  /**
   * Handles user editing the reps value.
   */
  onRepsInput(set: LoggedSet, event: Event) {
    const val = (event.target as HTMLInputElement).value;
    const num = val === '' ? undefined : parseInt(val, 10);
    this.clearValidationError(set.id);
    this.updateSet(set.id, { reps_completed: num });
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
    const hasValidReps =
      effectiveReps !== undefined && !isNaN(effectiveReps) && effectiveReps > 0;

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
}
