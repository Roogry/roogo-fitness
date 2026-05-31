import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '@/shared/components/header/header';
import { ZardCardComponent } from '@/shared/components/zard/card/card.component';
import { ZardButtonComponent } from '@/shared/components/zard/button/button.component';
import { ZardInputDirective } from '@/shared/components/zard/input/input.directive';
import { ZardSelectComponent, ZardSelectItemComponent } from '@/shared/components/zard/select';
import { MuscleService } from '@/core/services/muscle.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideSave,
  lucideX,
  lucideVideo,
  lucideChevronUp,
  lucideChevronDown,
  lucideTrash2,
  lucidePlus,
} from '@ng-icons/lucide';
import { ExerciseService } from '@/core/services/exercise.service';
import { Exercise, ExerciseMedia, Muscle } from '@/shared/models/workout.model';

@Component({
  selector: 'app-exercise-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    ZardCardComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardSelectComponent,
    ZardSelectItemComponent,
    NgIcon,
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

  isLoading = signal(true);
  isSaving = signal(false);
  selectedExercise = signal<Exercise | null>(null);

  // Form Fields
  name = signal('');
  primaryGroup = signal('');
  secondaryMuscles = signal<string[]>([]);
  media = signal<ExerciseMedia[]>([]);
  newMediaUrl = signal('');

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

        this.name.set(exercise.name);
        this.primaryGroup.set(exercise.primary_muscle?.name || '');

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

  addMedia() {
    const url = this.newMediaUrl().trim();
    if (!url) return;

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

    this.newMediaUrl.set('');
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

  save() {
    if (!this.selectedExercise() || !this.name().trim() || !this.primaryGroup().trim()) return;

    this.isSaving.set(true);

    // Simulate slight delay for realism
    const primaryName = this.primaryGroup().trim();
    const primaryMuscle = this.availableMuscles().find((m) => m.name === primaryName);
    const secondaryMuscles = this.secondaryMuscles()
      .map((name) => this.availableMuscles().find((m) => m.name === name))
      .filter((m): m is Muscle => !!m);

    this.exerciseService.updateExercise(this.selectedExercise()!, {
      name: this.name().trim(),
      primary_muscle: primaryMuscle,
      secondary_muscles: secondaryMuscles.length ? secondaryMuscles : undefined,
      media: this.media(),
    });
    this.isSaving.set(false);
    this.router.navigate(['/exercise', this.selectedExercise()?.id]);
  }
}
