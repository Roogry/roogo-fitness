import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutService } from '../shared/services/workout';
import { ExerciseAutocomplete } from '../components/exercise-autocomplete/exercise-autocomplete';
import { ExerciseTracker } from '../components/exercise-tracker/exercise-tracker';
import { ZardButtonComponent } from '../shared/components/button/button.component';
import { LucideAngularModule, Dumbbell, Save } from 'lucide-angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ExerciseAutocomplete,
    ExerciseTracker,
    ZardButtonComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="min-h-screen bg-background text-foreground pb-20">
      <!-- Header -->
      <header
        class="sticky top-0 z-40 w-full backdrop-blur-md bg-background/80 border-b border-border"
      >
        <div class="container mx-auto px-4 h-14 flex items-center justify-between">
          <div class="flex items-center gap-2 font-bold text-lg tracking-tight">
            <lucide-icon name="dumbbell" class="h-5 w-5 text-primary"></lucide-icon>
            <span>Roogo Fitness</span>
          </div>
          @if (workoutService.hasActiveWorkout()) {
            <button
              z-button
              size="sm"
              (click)="finishWorkout()"
              class="hidden sm:flex items-center gap-2"
            >
              <lucide-icon name="save" class="h-4 w-4"></lucide-icon>
              Finish Workout
            </button>
          }
        </div>
      </header>

      <main class="container mx-auto px-4 py-6 max-w-xl">
        <!-- Search -->
        <div class="mb-8">
          <h1 class="text-3xl font-extrabold tracking-tight mb-2">Track Workout</h1>
          <p class="text-muted-foreground mb-6">Search and add exercises to log your sets.</p>
          <app-exercise-autocomplete
            (exerciseSelected)="onExerciseSelected($event)"
          ></app-exercise-autocomplete>
        </div>

        <!-- Active Exercises -->
        <div class="space-y-6">
          @for (tracked of workoutService.activeExercises(); track tracked.exercise.id) {
            <app-exercise-tracker [trackedExercise]="tracked"></app-exercise-tracker>
          }

          @if (workoutService.activeExercises().length === 0) {
            <div
              class="py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl"
            >
              <lucide-icon name="dumbbell" class="h-12 w-12 mx-auto mb-4 opacity-20"></lucide-icon>
              <p>No exercises tracked yet.</p>
              <p class="text-sm mt-1">Search above to get started.</p>
            </div>
          }
        </div>
      </main>

      <!-- Mobile FAB -->
      @if (workoutService.hasActiveWorkout()) {
        <div class="fixed bottom-6 left-0 right-0 px-4 sm:hidden z-50">
          <button
            z-button
            class="w-full h-14 shadow-xl text-lg flex items-center justify-center gap-2 rounded-full"
            (click)="finishWorkout()"
          >
            <lucide-icon name="save" class="h-5 w-5"></lucide-icon>
            Finish Workout
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './home.css',
})
export class Home {
  readonly Dumbbell = Dumbbell;
  readonly Save = Save;
  workoutService = inject(WorkoutService);

  onExerciseSelected(exercise: any) {
    this.workoutService.addTrackedExercise(exercise);
  }

  async finishWorkout() {
    await this.workoutService.finishWorkout();
    alert('Workout finished successfully (Check console for mock API logs)');
  }
}
