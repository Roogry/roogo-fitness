import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutService } from '../shared/services/workout';
import { ExerciseAutocomplete } from '../components/exercise-autocomplete/exercise-autocomplete';
import { ExerciseTracker } from '../components/exercise-tracker/exercise-tracker';
import { HeaderComponent } from '../shared/components/header/header';
import { ZardButtonComponent } from '../shared/components/button/button.component';
import { ZardSheetComponent } from '../shared/components/sheet/sheet.component';
import { LucideAngularModule, Dumbbell, Save, Plus, X, ArrowLeft, Check, Clock, Activity, BarChart2 } from 'lucide-angular';

@Component({
  selector: 'app-workout-session',
  standalone: true,
  imports: [
    CommonModule,
    ExerciseAutocomplete,
    ExerciseTracker,
    HeaderComponent,
    ZardButtonComponent,
    ZardSheetComponent,
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
  readonly Check = Check;
  readonly Clock = Clock;
  readonly Activity = Activity;
  readonly BarChart2 = BarChart2;

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
