import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WorkoutService, ExerciseMedia, Muscle } from '../../shared/services/workout';
import { ZardCardComponent } from '../../shared/components/card/card.component';
import { ZardButtonComponent } from '../../shared/components/button/button.component';
import { ZardInputDirective } from '../../shared/components/input/input.directive';
import { HeaderComponent } from '../../shared/components/header/header';
import {
  LucideAngularModule,
  ArrowLeft,
  Save,
  X,
  Video,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
} from 'lucide-angular';
import { ZardSelectImports } from '@/shared/components/select';

@Component({
  selector: 'app-exercise-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardSelectImports,
    HeaderComponent,
    LucideAngularModule,
  ],
  templateUrl: './exercise-edit.html',
  styleUrl: './exercise-edit.css',
})
export class ExerciseEdit implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Save = Save;
  readonly X = X;
  readonly Video = Video;
  readonly ChevronUp = ChevronUp;
  readonly ChevronDown = ChevronDown;
  readonly Trash2 = Trash2;
  readonly Plus = Plus;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workoutService = inject(WorkoutService);

  isLoading = signal(true);
  isSaving = signal(false);
  exerciseId = signal<number | null>(null);

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
      if (idParam) {
        this.isLoading.set(true);
        const id = parseInt(idParam, 10);
        this.exerciseId.set(id);

        try {
          // Load muscles in parallel with exercise
          const [detail, muscles] = await Promise.all([
            this.workoutService.getExerciseById(id),
            this.workoutService.getMuscles(),
          ]);

          this.availableMuscles.set(muscles);

          if (detail) {
            this.name.set(detail.name);
            this.primaryGroup.set(detail.muscle_group);

            // Convert comma-separated string back to array if needed
            const sec = detail.secondary_muscles
              ? detail.secondary_muscles.split(',').map((s) => s.trim())
              : [];
            this.secondaryMuscles.set(sec);
            this.media.set([...(detail.media || [])]);
          } else {
            this.exerciseId.set(null);
          }
        } catch (error) {
          console.error('Failed to load exercise', error);
          this.exerciseId.set(null);
        } finally {
          this.isLoading.set(false);
        }
      } else {
        this.isLoading.set(false);
      }
    });
  }

  cancel() {
    const id = this.exerciseId();
    if (id) {
      this.router.navigate(['/exercise', id]);
    } else {
      this.router.navigate(['/']);
    }
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
    const id = this.exerciseId();
    if (!id || !this.name().trim() || !this.primaryGroup().trim()) return;

    this.isSaving.set(true);

    // Simulate slight delay for realism
    setTimeout(() => {
      this.workoutService.updateExercise(id, {
        name: this.name().trim(),
        muscle_group: this.primaryGroup().trim(),
        secondary_muscles: this.secondaryMuscles().length
          ? this.secondaryMuscles().join(', ')
          : undefined,
        media: this.media(),
      });
      this.isSaving.set(false);
      this.router.navigate(['/exercise', id]);
    }, 400);
  }
}
