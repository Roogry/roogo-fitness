import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDumbbell, lucidePlus, lucideCheck } from '@ng-icons/lucide';
import { WorkoutService } from '@/core/services/workout.service';
import { ExerciseAutocomplete } from '@/features/exercise/components/exercise-autocomplete/exercise-autocomplete';
import { ExerciseTracker } from '@/features/exercise/components/exercise-tracker/exercise-tracker';
import { HeaderComponent } from '@/shared/components/header/header';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { RooSheetComponent } from '@/shared/components/sheet';
import { ZardInputDirective } from '@/shared/components/zard/input';
import { WorkoutPlanSession } from '@/shared/models/workout.model';
import { form, FormField, required } from '@angular/forms/signals';
import { ZardFormImports } from '@/shared/components/zard/form';

@Component({
  selector: 'app-blueprint-session',
  standalone: true,
  imports: [
    CommonModule,
    ExerciseAutocomplete,
    ExerciseTracker,
    HeaderComponent,
    ZardButtonComponent,
    ZardInputDirective,
    RooSheetComponent,
    NgIcon,
    FormField,
    ZardFormImports,
  ],
  providers: [provideIcons({ lucideDumbbell, lucidePlus, lucideCheck })],
  templateUrl: './blueprint-session.html',
  styleUrl: './blueprint-session.css',
})
export class BlueprintSession implements OnInit {
  workoutService = inject(WorkoutService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  // State
  isAddSheetOpen = signal(false);
  selectedSession = signal<WorkoutPlanSession | null>(null);

  titleModel = signal({
    title: '',
  });

  titleForm = form(this.titleModel, (f) => {
    required(f.title, { message: 'Session title is required' });
  });

  constructor() {
    effect(() => {
      const isInvalid = this.titleForm().invalid();
      const currentTitle = this.titleModel().title;
      if (!isInvalid && this.workoutService.sessionTitle() !== currentTitle) {
        this.workoutService.sessionTitle.set(currentTitle);
      }
    });
  }

  ngOnInit() {
    const extTitle = this.workoutService.sessionTitle();
    if (extTitle !== this.titleModel().title) {
      this.titleModel.set({ title: extTitle });
    }

    this.route.paramMap.subscribe(async (params) => {
      const idParam = params.get('id');
      this.workoutService.selectedPlanId.set(parseInt(idParam ?? ''));
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
