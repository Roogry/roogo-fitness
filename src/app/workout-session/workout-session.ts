import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutService } from '../shared/services/workout';
import { ExerciseAutocomplete } from '../components/exercise-autocomplete/exercise-autocomplete';
import { ExerciseTracker } from '../components/exercise-tracker/exercise-tracker';
import { HeaderComponent } from '../shared/components/header/header';
import { ZardButtonComponent } from '../shared/components/button/button.component';
import { LucideAngularModule, Dumbbell, Save, Plus, X, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-workout-session',
  standalone: true,
  imports: [
    CommonModule,
    ExerciseAutocomplete,
    ExerciseTracker,
    HeaderComponent,
    ZardButtonComponent,
    LucideAngularModule,
  ],
  templateUrl: './workout-session.html',
  styleUrl: './workout-session.css',
})
export class WorkoutSession {
  readonly Dumbbell = Dumbbell;
  readonly Save = Save;
  readonly Plus = Plus;
  readonly X = X;
  readonly ArrowLeft = ArrowLeft;

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
