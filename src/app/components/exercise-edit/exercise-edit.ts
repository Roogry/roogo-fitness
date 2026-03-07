import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WorkoutService, ExerciseMedia } from '../../shared/services/workout';
import { ZardCardComponent } from '../../shared/components/card/card.component';
import { ZardButtonComponent } from '../../shared/components/button/button.component';
import { ZardInputDirective } from '../../shared/components/input/input.directive';
import { HeaderComponent } from '../../shared/components/header/header';
import { LucideAngularModule, ArrowLeft, Save, X, Video, ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-angular';

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
    HeaderComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="min-h-screen bg-background text-foreground pb-20">
      <!-- Header -->
      <app-header title="Edit Exercise" [showBackBtn]="true" (backClick)="cancel()"> </app-header>

      <main class="container mx-auto px-4 pb-8 max-w-2xl">
        @if (isLoading()) {
          <div class="flex justify-center py-12 text-muted-foreground">
            <div
              class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
            ></div>
          </div>
        } @else if (!exerciseId()) {
          <div
            class="py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl"
          >
            <h2 class="text-xl font-semibold text-foreground mb-2">Exercise Not Found</h2>
            <button (click)="cancel()" z-button class="mt-4">Go Back</button>
          </div>
        } @else {
          <z-card class="overflow-hidden border-border bg-card">
            <form (ngSubmit)="save()" #editForm="ngForm" class="flex flex-col gap-6">
              <div class="flex flex-col gap-3">
                <label
                  for="name"
                  class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Exercise Name <span class="text-destructive">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  z-input
                  [(ngModel)]="name"
                  required
                  placeholder="e.g. Barbell Bench Press"
                  class="w-full"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="flex flex-col gap-3">
                  <label
                    for="muscle"
                    class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Primary Muscle Group <span class="text-destructive">*</span>
                  </label>
                  <input
                    id="muscle"
                    name="muscle"
                    z-input
                    [(ngModel)]="muscleGroup"
                    required
                    placeholder="e.g. Chest"
                    class="w-full"
                  />
                </div>

                <div class="flex flex-col gap-3">
                  <label
                    for="secondary"
                    class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Secondary Muscles
                  </label>
                  <input
                    id="secondary"
                    name="secondary"
                    z-input
                    [(ngModel)]="secondaryMuscles"
                    placeholder="e.g. Triceps, Front Delts"
                    class="w-full"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-3">
                <label class="text-sm font-medium leading-none">Media Management</label>

                <div class="flex flex-col gap-3">
                  @for (m of media(); track m.id; let i = $index) {
                    <div class="flex items-center gap-3 p-3 border border-border rounded-xl bg-muted/30">
                      <div class="h-12 w-16 bg-muted rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                        @if (m.media_type === 'youtube' || m.media_type === 'video') {
                          <lucide-icon [img]="Video" class="h-5 w-5 text-muted-foreground"></lucide-icon>
                        } @else {
                          <img [src]="m.media_url" class="h-full w-full object-cover text-[8px]" alt="media" />
                        }
                      </div>
                      <div class="flex flex-col flex-1 overflow-hidden">
                        <span class="text-xs font-semibold capitalize">{{ m.media_type }}</span>
                        <span class="text-xs text-muted-foreground truncate">{{ m.media_url }}</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <button type="button" title="Move Up" z-button zType="ghost" zSize="icon-sm" zShape="circle" [disabled]="i === 0" (click)="moveMediaUp(i)">
                          <lucide-icon [img]="ChevronUp" class="h-4 w-4"></lucide-icon>
                        </button>
                        <button type="button" title="Move Down" z-button zType="ghost" zSize="icon-sm" zShape="circle" [disabled]="i === media().length - 1" (click)="moveMediaDown(i)">
                          <lucide-icon [img]="ChevronDown" class="h-4 w-4"></lucide-icon>
                        </button>
                        <button type="button" title="Remove" z-button zType="ghost" zSize="icon-sm" zShape="circle" class="text-destructive hover:text-destructive" (click)="removeMedia(i)">
                          <lucide-icon [img]="Trash2" class="h-4 w-4"></lucide-icon>
                        </button>
                      </div>
                    </div>
                  }
                  
                  @if (media().length === 0) {
                      <div class="py-6 text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                          No media added yet.
                      </div>
                  }
                </div>

                <div class="flex items-start gap-2 mt-2">
                  <div class="flex-1 flex flex-col gap-2">
                    <input z-input type="url" [(ngModel)]="newMediaUrl" name="newMediaUrl" placeholder="Add image or YouTube URL..." class="w-full" />
                  </div>
                  <button type="button" z-button zType="secondary" zShape="circle" class="h-12" (click)="addMedia()" [disabled]="!newMediaUrl().trim()">
                    <lucide-icon [img]="Plus"></lucide-icon> Add
                  </button>
                </div>
              </div>

              <div
                class="pt-6 border-t border-border flex flex-col-reverse sm:flex-row gap-3 sm:justify-end"
              >
                <button
                  type="button"
                  z-button
                  zType="ghost"
                  zSize="lg"
                  zShape="circle"
                  (click)="cancel()"
                  class="w-full sm:w-auto"
                >
                  <lucide-icon [img]="X" class="h-4 w-4"></lucide-icon> Cancel
                </button>
                <button
                  type="submit"
                  z-button
                  zSize="lg"
                  zShape="circle"
                  [disabled]="!editForm.form.valid || isSaving()"
                  class="w-full sm:w-auto"
                >
                  <lucide-icon [img]="Save" class="h-4 w-4"></lucide-icon> Save Changes
                </button>
              </div>
            </form>
          </z-card>
        }
      </main>
    </div>
  `,
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
  muscleGroup = signal('');
  secondaryMuscles = signal('');
  media = signal<ExerciseMedia[]>([]);
  newMediaUrl = signal('');

  ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.isLoading.set(true);
        const id = parseInt(idParam, 10);
        this.exerciseId.set(id);

        try {
          const detail = await this.workoutService.getExerciseById(id);
          if (detail) {
            this.name.set(detail.name);
            this.muscleGroup.set(detail.muscle_group);
            this.secondaryMuscles.set(detail.secondary_muscles || '');
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
    if (!id || !this.name().trim() || !this.muscleGroup().trim()) return;

    this.isSaving.set(true);

    // Simulate slight delay for realism
    setTimeout(() => {
      this.workoutService.updateExercise(id, {
        name: this.name().trim(),
        muscle_group: this.muscleGroup().trim(),
        secondary_muscles: this.secondaryMuscles().trim() || undefined,
        media: this.media(),
      });
      this.isSaving.set(false);
      this.router.navigate(['/exercise', id]);
    }, 400);
  }
}
