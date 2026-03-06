import { Component, input, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkoutService, TrackedExercise, WorkoutSet } from '../../shared/services/workout';
import { ZardCardComponent } from '../../shared/components/card/card.component';
import { ZardButtonComponent } from '../../shared/components/button/button.component';
import { ZardInputDirective } from '../../shared/components/input/input.directive';
import { LucideAngularModule, Trash2, Plus, GripVertical } from 'lucide-angular';

@Component({
  selector: 'app-exercise-tracker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardInputDirective,
    LucideAngularModule,
  ],
  template: `
    <z-card class="mb-4 overflow-hidden border-border bg-card">
      <!-- Header -->
      <div class="p-4 bg-muted/30 flex justify-between items-center border-b border-border">
        <div>
          <h3 class="font-semibold text-lg">{{ trackedExercise().exercise.name }}</h3>
          <p class="text-sm text-muted-foreground">{{ trackedExercise().exercise.muscle_group }}</p>
        </div>
        <button
          z-button
          zType="ghost"
          zSize="icon"
          (click)="removeExercise()"
          class="text-destructive hover:bg-destructive/10"
        >
          <lucide-icon [img]="Trash2" class="h-4 w-4"></lucide-icon>
        </button>
      </div>

      <!-- Sets List -->
      <div class="p-4 flex flex-col gap-3">
        @if (trackedExercise().sets.length > 0) {
          <div
            class="grid grid-cols-12 gap-1 md:gap-2 px-1 md:px-2 text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1"
          >
            <div class="col-span-2 text-center">Set</div>
            <div class="col-span-4 text-center">KG</div>
            <div class="col-span-4 text-center">Reps</div>
            <div class="col-span-2 text-center"></div>
          </div>
        }

        @for (set of trackedExercise().sets; track set.id) {
          <div
            class="grid grid-cols-12 gap-1 md:gap-2 items-center bg-muted/20 p-1 md:p-2 rounded-md transition-colors hover:bg-muted/40 group"
          >
            <div class="col-span-2 text-center font-medium">{{ set.set_number }}</div>
            <div class="col-span-4 flex justify-center">
              <input
                z-input
                type="number"
                [ngModel]="set.weight_lifted"
                (ngModelChange)="updateSet(set.id, { weight_lifted: $event })"
                [class]="'h-8 max-w-[80px] text-center'"
              />
            </div>
            <div class="col-span-4 flex justify-center">
              <input
                z-input
                type="number"
                [ngModel]="set.reps_completed"
                (ngModelChange)="updateSet(set.id, { reps_completed: $event })"
                [class]="'h-8 max-w-[80px] text-center'"
              />
            </div>
            <div
              class="col-span-2 flex justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            >
              <button
                z-button
                zType="ghost"
                zSize="icon"
                class="h-8 w-8 text-destructive hover:bg-destructive/10"
                (click)="removeSet(set.id)"
              >
                <lucide-icon [img]="Trash2" class="h-4 w-4"></lucide-icon>
              </button>
            </div>
          </div>
        }

        <!-- Add Set Form -->
        <div class="mt-4 pt-4 border-t border-border">
          <form
            class="flex flex-col sm:flex-row items-stretch sm:items-end gap-3"
            (submit)="$event.preventDefault(); addSet()"
          >
            <div class="flex-1">
              <label class="text-xs text-muted-foreground mb-1 block">Weight (KG)</label>
              <input
                z-input
                type="number"
                [(ngModel)]="newWeight"
                name="newWeight"
                placeholder="0"
                [class]="'w-full text-center'"
                required
                min="0"
                step="0.5"
              />
            </div>
            <div class="flex-1">
              <label class="text-xs text-muted-foreground mb-1 block">Reps</label>
              <input
                z-input
                type="number"
                [(ngModel)]="newReps"
                name="newReps"
                placeholder="0"
                [class]="'w-full text-center'"
                required
                min="1"
                step="1"
              />
            </div>
            <button
              z-button
              type="submit"
              [disabled]="!isValid()"
              class="w-full h-10 sm:w-12 flex items-center justify-center shrink-0"
            >
              <lucide-icon [img]="Plus" class="h-5 w-5 mr-2 sm:mr-0"></lucide-icon>
              <span class="sm:hidden">Add Set</span>
            </button>
          </form>
        </div>
      </div>
    </z-card>
  `,
  styleUrl: './exercise-tracker.css',
})
export class ExerciseTracker {
  readonly Trash2 = Trash2;
  readonly Plus = Plus;
  readonly GripVertical = GripVertical;

  private workoutService = inject(WorkoutService);

  // The exercise data passed from the parent
  trackedExercise = input.required<TrackedExercise>();

  // Local state for the "Add Set" form
  newWeight = signal<number | null>(null);
  newReps = signal<number | null>(null);

  isValid = computed(() => {
    const w = this.newWeight();
    const r = this.newReps();
    return w !== null && w >= 0 && r !== null && r > 0;
  });

  addSet() {
    if (!this.isValid()) return;
    this.workoutService.addSet(
      this.trackedExercise().exercise.id,
      this.newWeight()!,
      this.newReps()!,
    );
    // Optionally keep the weight but clear reps for the next set to speed up entry
    this.newReps.set(null);
  }

  updateSet(setId: string, updates: Partial<WorkoutSet>) {
    this.workoutService.updateSet(this.trackedExercise().exercise.id, setId, updates);
  }

  removeSet(setId: string) {
    this.workoutService.removeSet(this.trackedExercise().exercise.id, setId);
  }

  removeExercise() {
    this.workoutService.removeTrackedExercise(this.trackedExercise().exercise.id);
  }
}
