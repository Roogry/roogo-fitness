import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Dumbbell, Save, Plus, X, ArrowLeft, Check, Clock, Activity, BarChart2 } from 'lucide-angular';
import { WorkoutService } from '@/shared/services/workout.service';
import { ExerciseAutocomplete } from '@/components/exercise-autocomplete/exercise-autocomplete';
import { ExerciseTracker } from '@/components/exercise-tracker/exercise-tracker';
import { HeaderComponent } from '@/shared/components/header/header';
import { ZardButtonComponent } from '@/shared/components/button';
import { RooSheetComponent } from '@/shared/components/sheet/sheet';

@Component({
  selector: 'app-workout-session',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ExerciseAutocomplete,
    ExerciseTracker,
    HeaderComponent,
    ZardButtonComponent,
    RooSheetComponent,
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
  router = inject(Router);

  isAddSheetOpen = signal(false);

  onExerciseSelected(exercise: any) {
    this.workoutService.addTrackedExercise(exercise);
    this.isAddSheetOpen.set(false);
  }

  async finishWorkout() {
    const isPlanRecord = this.workoutService.sessionMode() === 'create';
    await this.workoutService.finishWorkout();
    
    if (isPlanRecord) {
      alert('Workout template successfully saved to plan!');
      this.router.navigate(['/blueprint']);
    } else {
      alert('Workout finished successfully (Check console for mock API logs)');
    }
  }
}
