import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LucideAngularModule,
  Dumbbell,
  Save,
  Plus,
  X,
  ArrowLeft,
  Check,
  Clock,
  Activity,
} from 'lucide-angular';
import { WorkoutService } from '@/shared/services/workout.service';
import { ExerciseAutocomplete } from '@/components/exercise-autocomplete/exercise-autocomplete';
import { ExerciseTracker } from '@/components/exercise-tracker/exercise-tracker';
import { HeaderComponent } from '@/shared/components/header/header';
import { ZardButtonComponent } from '@/shared/components/button';
import { RooSheetComponent } from '@/shared/components/sheet/sheet';
import { DurationFormatPipe } from '@/shared/pipes/duration-format-pipe';
import { ZardInputDirective } from '@/shared/components/input';

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
    ZardInputDirective,
    RooSheetComponent,
    LucideAngularModule,
    DurationFormatPipe,
  ],
  templateUrl: './workout-session.html',
  styleUrl: './workout-session.css',
})
export class WorkoutSession implements OnInit {
  readonly Dumbbell = Dumbbell;
  readonly Save = Save;
  readonly Plus = Plus;
  readonly X = X;
  readonly ArrowLeft = ArrowLeft;
  readonly Check = Check;
  readonly Clock = Clock;
  readonly Activity = Activity;

  workoutService = inject(WorkoutService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  // State
  isAddSheetOpen = signal(false);

  ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      const action = params.get('action');

      if (action === 'create') {
        this.workoutService.sessionTitle.set('Workout Session');
      } else if (action === 'start') {
        this.route.queryParamMap.subscribe(async (queryParams) => {
          const planId = queryParams.get('planId');
          const sessionId = queryParams.get('sessionId');
          
          if (planId && sessionId) {
            await this.workoutService.startSessionFromBlueprint(Number(planId), Number(sessionId));
          }
        });
      } else {
        //TODO: handle get template session
      }
    });
  }

  onExerciseSelected(exercise: any) {
    this.workoutService.addTrackedExercise(exercise);
    this.isAddSheetOpen.set(false);
  }

  async finishSession() {
    await this.workoutService.finishSession();
    alert('Workout finished successfully');
    this.router.navigate(['/journey']);
  }
}
