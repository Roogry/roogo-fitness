import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '@/shared/components/header/header.component';
import { ZardCardComponent } from '@/shared/components/zard/card/card.component';
import { ZardButtonComponent } from '@/shared/components/zard/button/button.component';
import { ZardInputDirective } from '@/shared/components/zard/input/input.directive';
import { ZardSelectComponent, ZardSelectItemComponent } from '@/shared/components/zard/select';
import { MuscleService } from '@/core/services/muscle.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { ZardFormImports } from '@/shared/components/zard/form';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  lucideArrowLeft,
  lucideSave,
  lucideX,
  lucideVideo,
  lucideChevronUp,
  lucideChevronDown,
  lucideTrash2,
  lucidePlus,
  lucideGripVertical,
} from '@ng-icons/lucide';
import { ExerciseService } from '@/core/services/exercise.service';
import { WorkoutService } from '@/core/services/workout.service';
import { Exercise, ExerciseMedia, Muscle } from '@/shared/models';
import { ExerciseInstructionList } from '../../components/exercise-instruction-list/exercise-instruction-list';
import { ExerciseMediaManagement } from '../../components/exercise-media-management/exercise-media-management';

@Component({
  selector: 'app-exercise-edit',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    ZardCardComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardSelectComponent,
    ZardSelectItemComponent,
    NgIcon,
    FormField,
    ZardFormImports,
    ExerciseInstructionList,
    ExerciseMediaManagement,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideSave,
      lucideX,
      lucideVideo,
      lucideChevronUp,
      lucideChevronDown,
      lucideTrash2,
      lucidePlus,
      lucideGripVertical,
    }),
  ],
  templateUrl: './exercise-edit.html',
  styleUrl: './exercise-edit.css',
})
export class ExerciseEdit implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private exerciseService = inject(ExerciseService);
  private muscleService = inject(MuscleService);
  private workoutService = inject(WorkoutService);

  isLoading = signal(true);
  isSaving = signal(false);
  selectedExercise = signal<Exercise | null>(null);

  // Form Fields
  exerciseModel = signal({
    name: '',
    primaryGroup: '',
    short_description: '',
    tips: '',
    instructions: [] as string[],
  });

  exerciseForm = form(this.exerciseModel, (f) => {
    required(f.name, { message: 'Nama wajib diisi' });
    required(f.primaryGroup, { message: 'Primary muscle wajib dipilih' });
  });

  secondaryMuscles = signal<string[]>([]);
  media = signal<ExerciseMedia[]>([]);

  availableMuscles = signal<Muscle[]>([]);

  ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      const idParam = params.get('id');

      try {
        this.isLoading.set(true);

        if (!idParam) throw new Error('Failed to load exercise');

        // Load muscles in parallel with exercise
        const id = parseInt(idParam, 10);
        const [exercise, muscles] = await Promise.all([
          this.exerciseService.getExerciseById(id),
          this.muscleService.getMuscles(),
        ]);

        if (!exercise) throw new Error('Failed to load exercise');

        this.availableMuscles.set(muscles);

        this.exerciseModel.set({
          name: exercise.name,
          primaryGroup: exercise.primary_muscle?.name || '',
          short_description: exercise.short_description || '',
          tips: exercise.tips || '',
          instructions: exercise.instructions || [],
        });
        this.exerciseForm().reset();

        const secondaryMuscles = exercise.secondary_muscles?.map((m) => m.name) || [];
        this.secondaryMuscles.set(secondaryMuscles);
        this.media.set([...(exercise.media || [])]);

        this.selectedExercise.set(exercise);
      } catch (error) {
        console.error('Failed to load exercise', error);
        this.selectedExercise.set(null);
      } finally {
        this.isLoading.set(false);
      }
    });
  }

  cancel() {
    if (this.selectedExercise()?.id) {
      this.router.navigate(['/exercise', this.selectedExercise()?.id]);
      return;
    }

    this.router.navigate(['/']);
  }

  addMedia(url: string) {
    let type = 'image';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      type = 'youtube';
    } else if (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg')) {
      type = 'video';
    }

    this.media.update((current) => {
      return [
        ...current,
        {
          id: Date.now(),
          media_type: type,
          media_url: url,
          display_order: current.length,
        },
      ];
    });
  }

  removeMedia(index: number) {
    this.media.update((current) => {
      const updated = [...current];
      updated.splice(index, 1);
      return updated.map((m, i) => ({ ...m, display_order: i }));
    });
  }

  moveMediaUp(index: number) {
    if (index === 0) return;
    this.media.update((current) => {
      const updated = [...current];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return updated.map((m, i) => ({ ...m, display_order: i }));
    });
  }

  moveMediaDown(index: number) {
    if (index === this.media().length - 1) return;
    this.media.update((current) => {
      const updated = [...current];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return updated.map((m, i) => ({ ...m, display_order: i }));
    });
  }

  addInstruction() {
    this.exerciseModel.update((m) => ({
      ...m,
      instructions: [...m.instructions, ''],
    }));
  }

  removeInstruction(index: number) {
    this.exerciseModel.update((m) => ({
      ...m,
      instructions: m.instructions.filter((_, i) => i !== index),
    }));
  }

  drop(event: CdkDragDrop<string[]>) {
    this.exerciseModel.update((m) => {
      const newInstructions = [...m.instructions];
      moveItemInArray(newInstructions, event.previousIndex, event.currentIndex);
      return { ...m, instructions: newInstructions };
    });
  }

  save() {
    submit(this.exerciseForm, async (f) => {
      if (!this.selectedExercise()) return;

      this.isSaving.set(true);

      const name = f.name().value().trim();
      const shortDescription = f.short_description().value().trim();
      const primaryName = f.primaryGroup().value().trim();
      const primaryMuscle = this.availableMuscles().find((m) => m.name === primaryName);
      const secondaryMuscles = this.secondaryMuscles()
        .map((name) => this.availableMuscles().find((m) => m.name === name))
        .filter((m): m is Muscle => !!m);

      const instructions = f
        .instructions()
        .value()
        .map((step: string) => step.trim())
        .filter(Boolean);
      const tips = f.tips().value().trim();

      await this.exerciseService.updateExercise(this.selectedExercise()!, {
        name: name,
        short_description: shortDescription,
        primary_muscle: primaryMuscle,
        secondary_muscles: secondaryMuscles.length ? secondaryMuscles : undefined,
        media: this.media(),
        instructions: instructions,
        tips: tips,
      });
      // Sync active session if running (fixes #61 stale data)
      if (this.workoutService.trackedExercises().length > 0) {
        await this.workoutService.refreshTrackedExercises();
      }
      this.isSaving.set(false);
      this.router.navigate(['/exercise', this.selectedExercise()?.id], { replaceUrl: true });
    });
  }
}
