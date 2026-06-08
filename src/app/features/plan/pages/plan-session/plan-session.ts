import { Component, inject, OnInit, signal, effect, computed } from '@angular/core';
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
import { ZardDialogService } from '@/shared/components/zard/dialog';

@Component({
  selector: 'app-plan-session',
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
  templateUrl: './plan-session.html',
  styleUrl: './plan-session.css',
})
export class PlanSession implements OnInit {
  workoutService = inject(WorkoutService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  dialogService = inject(ZardDialogService);

  // State
  isAddSheetOpen = signal(false);
  selectedSession = signal<WorkoutPlanSession | null>(null);
  editSessionId = signal<number | null>(null);
  isEditMode = computed(() => this.editSessionId() !== null);

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
      const planId = parseInt(idParam ?? '');
      this.workoutService.selectedPlanId.set(planId);

      const sessionIdParam = params.get('sessionId');
      if (sessionIdParam) {
        const sessionId = Number(sessionIdParam);
        this.editSessionId.set(sessionId);
        await this.workoutService.setSessionFromPlan(planId, sessionId);
        this.titleModel.set({ title: this.workoutService.sessionTitle() });
      } else {
        this.editSessionId.set(null);
      }
    });
  }

  onExerciseSelected(exercise: any) {
    this.workoutService.addTrackedExercise(exercise);
    this.isAddSheetOpen.set(false);
  }

  async onSaveSessionClick() {
    if (this.isEditMode()) {
      await this.workoutService.updateSession(this.editSessionId()!);
      this.dialogService.create({
        zWidth: '400px',
        zTitle: 'Success',
        zDescription: 'Workout template successfully updated!',
        zOkText: 'OK',
        zOnOk: () => {
          this.router.navigate(['/plan']);
        },
      });
    } else {
      await this.workoutService.createSession();
      this.dialogService.create({
        zWidth: '400px',
        zTitle: 'Success',
        zDescription: 'Workout template successfully saved to plan!',
        zOkText: 'OK',
        zOnOk: () => {
          this.router.navigate(['/plan']);
        },
      });
    }
  }
}
