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
import { ZardInputDirective } from '@/shared/components/input';
import { WorkoutPlanSession } from '@/shared/types/workout.types';

@Component({
  selector: 'app-blueprint-session',
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
  ],
  templateUrl: './blueprint-session.html',
  styleUrl: './blueprint-session.css',
})
export class BlueprintSession implements OnInit {
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
  selectedSession = signal<WorkoutPlanSession | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      const idParam = params.get('id');

      //TODO: handle edit
    });
  }

  onExerciseSelected(exercise: any) {
    this.workoutService.addTrackedExercise(exercise);
    this.isAddSheetOpen.set(false);
  }

  async createSession() {
    await this.workoutService.createSession();
    alert('Workout template successfully saved to plan!');
    this.router.navigate(['/blueprint']);
  }
}
