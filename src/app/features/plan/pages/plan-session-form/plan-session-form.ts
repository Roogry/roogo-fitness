import { Component, inject, OnInit, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDumbbell, lucidePlus, lucideCheck, lucideGripVertical } from '@ng-icons/lucide';
import { CdkDragDrop, CdkDropList, CdkDrag, CdkDragHandle, moveItemInArray } from '@angular/cdk/drag-drop';
import { PlanService } from '@/core/services/plan.service';
import { ExerciseAutocomplete } from '@/features/exercise/components/exercise-autocomplete/exercise-autocomplete';
import { PlanExerciseCardComponent } from '../../components/plan-exercise-card/plan-exercise-card';
import { HeaderComponent } from '@/shared/components/header/header.component';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { RooSheetComponent } from '@/shared/components/sheet';
import { ZardInputDirective } from '@/shared/components/zard/input';
import { ExerciseService } from '@/core/services/exercise.service';
import { Exercise, WorkoutPlanSession, WorkoutPlanExercise } from '@/shared/models';
import { form, FormField, required } from '@angular/forms/signals';
import { ZardFormImports } from '@/shared/components/zard/form';
import { ZardDialogService } from '@/shared/components/zard/dialog';

@Component({
  selector: 'app-plan-session',
  standalone: true,
  imports: [
    CommonModule,
    ExerciseAutocomplete,
    PlanExerciseCardComponent,
    HeaderComponent,
    ZardButtonComponent,
    ZardInputDirective,
    RooSheetComponent,
    NgIcon,
    FormField,
    ZardFormImports,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
  ],
  providers: [provideIcons({ lucideDumbbell, lucidePlus, lucideCheck, lucideGripVertical })],
  templateUrl: './plan-session-form.html',
})
export class PlanSessionForm implements OnInit {
  planService = inject(PlanService);
  exerciseService = inject(ExerciseService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  dialogService = inject(ZardDialogService);

  // State
  isAddSheetOpen = signal(false);
  selectedSession = signal<WorkoutPlanSession | null>(null);
  editSessionId = signal<number | null>(null);
  isEditMode = computed(() => this.editSessionId() !== null);
  exercisesMap = signal<Map<number, Exercise>>(new Map());

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
      if (!isInvalid && this.planService.sessionTitle() !== currentTitle) {
        this.planService.sessionTitle.set(currentTitle);
      }
    });

    effect(async () => {
      const plannedList = this.planService.plannedExercises();
      const ids = plannedList
        .filter((pe) => pe && pe.exercise_id !== undefined && pe.exercise_id !== null)
        .map((pe) => pe.exercise_id);
      const res = await this.exerciseService.loadExercisesToMap(ids, this.exercisesMap());
      if (res.changed) {
        this.exercisesMap.set(res.map);
      }
    });
  }

  ngOnInit() {
    const extTitle = this.planService.sessionTitle();
    if (extTitle !== this.titleModel().title) {
      this.titleModel.set({ title: extTitle });
    }

    this.route.paramMap.subscribe(async (params) => {
      const planId = parseInt(params.get('id') ?? '');
      this.planService.selectedPlanId.set(planId);

      const sessionIdParam = params.get('sessionId');
      if (sessionIdParam) {
        const sessionId = Number(sessionIdParam);
        this.editSessionId.set(sessionId);
        await this.planService.setSessionFromPlan(planId, sessionId);
        this.titleModel.set({ title: this.planService.sessionTitle() });
      } else {
        this.editSessionId.set(null);
      }
    });
  }

  onExerciseSelected(exercise: any) {
    this.exercisesMap.update((m) => {
      const newMap = new Map(m);
      newMap.set(exercise.id, exercise);
      return newMap;
    });
    this.planService.addPlannedExercise(exercise);
    this.isAddSheetOpen.set(false);
  }

  onUpdateTarget(exerciseId: number, updates: any) {
    this.planService.updatePlannedExercise(exerciseId, updates);
  }

  onRemoveExercise(exerciseId: number) {
    this.planService.removePlannedExercise(exerciseId);
  }

  onDrop(event: CdkDragDrop<WorkoutPlanExercise[]>) {
    const current = [...this.planService.plannedExercises()];
    moveItemInArray(current, event.previousIndex, event.currentIndex);
    // Update order indices
    const reordered = current.map((pe, idx) => ({ ...pe, exercise_order: idx }));
    this.planService.plannedExercises.set(reordered);
  }

  async onSaveSessionClick() {
    if (this.isEditMode()) {
      await this.planService.updateSession(this.editSessionId()!);

      this.dialogService.create({
        zWidth: '400px',
        zTitle: 'Success',
        zDescription: 'Workout template successfully updated!',
        zOkText: 'OK',
        zOnOk: () => {
          this.router.navigate(['/plan']);
        },
      });
      this.planService.clearPlanSession();
    } else {
      await this.planService.createSession();

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
