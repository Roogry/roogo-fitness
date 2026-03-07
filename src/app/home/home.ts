import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutService } from '../shared/services/workout';
import { ExerciseAutocomplete } from '../components/exercise-autocomplete/exercise-autocomplete';
import { ExerciseTracker } from '../components/exercise-tracker/exercise-tracker';
import { HeaderComponent } from '../shared/components/header/header';
import { ZardButtonComponent } from '../shared/components/button/button.component';
import { LucideAngularModule, Dumbbell, Save, Plus, X } from 'lucide-angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ExerciseAutocomplete,
    ExerciseTracker,
    HeaderComponent,
    ZardButtonComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="min-h-screen bg-background text-foreground pb-20">
      <!-- Header -->
      <app-header title="Roogo Fitness">
        <lucide-icon
          title-icon
          [img]="Dumbbell"
          class="h-5 w-5 text-primary flex-shrink-0"
        ></lucide-icon>
        @if (workoutService.hasActiveWorkout()) {
          <button
            right
            z-button
            size="sm"
            (click)="finishWorkout()"
            class="hidden sm:flex items-center gap-2"
          >
            <lucide-icon [img]="Save" class="h-4 w-4"></lucide-icon>
            Finish
          </button>
        }
      </app-header>

      <main class="container mx-auto px-4 py-6 max-w-2xl">
        <div class="mb-6">
          <div>
            <h1 class="text-3xl font-extrabold tracking-tight mb-2">Track Workout</h1>
            <p class="text-muted-foreground">Log your sets for today.</p>
          </div>
        </div>

        <!-- Active Exercises -->
        <div class="space-y-6">
          @if (workoutService.activeExercises().length === 0) {
            <div
              class="py-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl"
            >
              <lucide-icon [img]="Dumbbell" class="h-12 w-12 mx-auto mb-4"></lucide-icon>
              <p>No exercises tracked yet.</p>
            </div>
          }

          @for (tracked of workoutService.activeExercises(); track tracked.exercise.id) {
            <app-exercise-tracker [trackedExercise]="tracked"></app-exercise-tracker>
          }

          <button z-button class="w-full py-6" (click)="isAddSheetOpen.set(true)">
            <lucide-icon [img]="Plus"></lucide-icon>
            Add Exercise
          </button>
        </div>
      </main>

      <!-- Mobile FABs -->
      <div
        class="fixed bottom-6 right-4 left-4 sm:hidden flex flex-col gap-3 z-30 pointer-events-none"
      >
        @if (workoutService.hasActiveWorkout()) {
          <button
            z-button
            zType="outline"
            class="h-14 shadow-xl text-lg flex items-center justify-center gap-2 rounded-full w-full bg-background pointer-events-auto"
            (click)="finishWorkout()"
          >
            <lucide-icon [img]="Save" class="h-5 w-5"></lucide-icon>
            Finish Workout
          </button>
        }
      </div>

      <!-- Add Exercise Sheet -->
      @if (isAddSheetOpen()) {
        <!-- Backdrop -->
        <div
          class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
          (click)="isAddSheetOpen.set(false)"
        ></div>

        <!-- Sheet Container -->
        <div
          class="fixed z-50 bg-background shadow-2xl transition-transform flex flex-col
                 bottom-0 left-0 right-0 h-[85vh] rounded-t-2xl
                 md:top-0 md:bottom-0 md:left-auto md:right-0 md:h-full md:w-[450px] md:rounded-none md:border-l md:border-border slide-in"
        >
          <!-- Sheet Header -->
          <div class="p-4 border-b border-border flex justify-between items-center bg-muted/10">
            <h2 class="font-semibold text-lg tracking-tight">Add Exercise</h2>
            <button
              z-button
              zType="ghost"
              zSize="icon"
              (click)="isAddSheetOpen.set(false)"
              class="rounded-full"
            >
              <lucide-icon [img]="X"></lucide-icon>
            </button>
          </div>

          <!-- Sheet Content -->
          <div class="p-4 flex-1 overflow-y-auto">
            <p class="text-sm text-muted-foreground mb-4">
              Search locally or add a custom exercise to begin tracking.
            </p>
            <app-exercise-autocomplete
              (exerciseSelected)="onExerciseSelected($event)"
            ></app-exercise-autocomplete>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .slide-in {
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideIn {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
    }

    @media (min-width: 768px) {
      .slide-in {
        animation: slideInMd 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes slideInMd {
        from {
          transform: translateX(100%);
        }
        to {
          transform: translateX(0);
        }
      }
    }
  `,
})
export class Home {
  readonly Dumbbell = Dumbbell;
  readonly Save = Save;
  readonly Plus = Plus;
  readonly X = X;

  workoutService = inject(WorkoutService);

  isAddSheetOpen = signal(false);

  onExerciseSelected(exercise: any) {
    this.workoutService.addTrackedExercise(exercise);
    this.isAddSheetOpen.set(false);
  }

  async finishWorkout() {
    await this.workoutService.finishWorkout();
    alert('Workout finished successfully (Check console for mock API logs)');
  }
}
