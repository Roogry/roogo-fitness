import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WorkoutService } from '../../shared/services/workout';
import { ZardCardComponent } from '../../shared/components/card/card.component';
import { ZardButtonComponent } from '../../shared/components/button/button.component';
import { ZardInputDirective } from '../../shared/components/input/input.directive';
import { HeaderComponent } from '../../shared/components/header/header';
import { LucideAngularModule, ArrowLeft, Save, X } from 'lucide-angular';

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

              <div class="flex flex-col gap-3 opacity-50">
                <label
                  for="media"
                  class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Media URL (Disabled for now)
                </label>
                <input
                  id="media"
                  name="media"
                  type="url"
                  z-input
                  disabled
                  placeholder="https://example.com/image.jpg"
                  class="w-full"
                />
                <p class="text-[0.8rem] text-muted-foreground">
                  Media editing is temporarily read-only while we upgrade to the new gallery system.
                </p>
              </div>

              <div
                class="pt-6 border-t border-border flex flex-col-reverse sm:flex-row gap-3 sm:justify-end"
              >
                <button
                  type="button"
                  z-button
                  zType="secondary"
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
      });
      this.isSaving.set(false);
      this.router.navigate(['/exercise', id]);
    }, 400);
  }
}
