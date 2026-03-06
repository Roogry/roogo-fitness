import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { WorkoutService, Exercise } from '../../shared/services/workout';
import { ZardCardComponent } from '../../shared/components/card/card.component';
import { ZardButtonComponent } from '../../shared/components/button/button.component';
import { LucideAngularModule, ArrowLeft, Dumbbell, Activity, Info } from 'lucide-angular';

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ZardCardComponent,
    ZardButtonComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="min-h-screen bg-background text-foreground pb-20">
      <!-- Header -->
      <header
        class="sticky top-0 z-40 w-full backdrop-blur-md bg-background/80 border-b border-border"
      >
        <div class="container mx-auto px-4 h-14 flex items-center gap-4">
          <a routerLink="/" z-button zType="ghost" zSize="icon">
            <lucide-icon [img]="ArrowLeft" class="h-5 w-5"></lucide-icon>
            <span class="sr-only">Back</span>
          </a>
          <h1 class="font-bold text-lg tracking-tight truncate flex-1">
            {{ exercise()?.name || 'Loading...' }}
          </h1>
        </div>
      </header>

      <main class="container mx-auto px-4 py-8 max-w-2xl">
        @if (isLoading()) {
          <div class="flex justify-center py-12 text-muted-foreground">
            <div
              class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
            ></div>
          </div>
        } @else if (exercise()) {
          <z-card class="overflow-hidden border-border bg-card">
            <div
              class="p-6 md:p-8 flex flex-col items-center text-center border-b border-border bg-gradient-to-b from-muted/50 to-transparent"
            >
              <div
                class="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4"
              >
                <lucide-icon [img]="Dumbbell" class="h-10 w-10 text-primary"></lucide-icon>
              </div>
              <h2 class="text-3xl font-extrabold tracking-tight mb-2">{{ exercise()!.name }}</h2>
              <div
                class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground"
              >
                {{ exercise()!.muscle_group }}
              </div>
            </div>

            <div class="p-6 md:p-8 space-y-6">
              <div>
                <h3 class="flex items-center gap-2 text-lg font-semibold mb-3">
                  <lucide-icon [img]="Info" class="h-5 w-5 text-muted-foreground"></lucide-icon>
                  About this exercise
                </h3>
                <p class="text-muted-foreground leading-relaxed">
                  This is a placeholder description for <strong>{{ exercise()!.name }}</strong
                  >. In a full application, this section would contain detailed instructions, form
                  cues, common mistakes, and video demonstrations for targeting the
                  {{ exercise()!.muscle_group }} muscles.
                </p>
              </div>

              <div class="pt-6 border-t border-border">
                <h3 class="flex items-center gap-2 text-lg font-semibold mb-4">
                  <lucide-icon [img]="Activity" class="h-5 w-5 text-muted-foreground"></lucide-icon>
                  Performance Stats
                </h3>
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-muted/30 p-4 rounded-lg flex flex-col items-center text-center">
                    <span class="text-3xl font-bold mb-1">-</span>
                    <span class="text-xs text-muted-foreground uppercase tracking-wider"
                      >Personal Record</span
                    >
                  </div>
                  <div class="bg-muted/30 p-4 rounded-lg flex flex-col items-center text-center">
                    <span class="text-3xl font-bold mb-1">-</span>
                    <span class="text-xs text-muted-foreground uppercase tracking-wider"
                      >Times Performed</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </z-card>
        } @else {
          <div
            class="py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl mt-6"
          >
            <lucide-icon [img]="Dumbbell" class="h-12 w-12 mx-auto mb-4 opacity-20"></lucide-icon>
            <h2 class="text-xl font-semibold text-foreground mb-2">Exercise Not Found</h2>
            <p>The exercise you requested could not be found.</p>
            <a routerLink="/" z-button class="mt-6">Return Home</a>
          </div>
        }
      </main>
    </div>
  `,
  styles: ``,
})
export class ExerciseDetail implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Dumbbell = Dumbbell;
  readonly Activity = Activity;
  readonly Info = Info;

  private route = inject(ActivatedRoute);
  private workoutService = inject(WorkoutService);

  exercise = signal<Exercise | undefined>(undefined);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.isLoading.set(true);
        const id = parseInt(idParam, 10);
        try {
          const detail = await this.workoutService.getExerciseById(id);
          this.exercise.set(detail);
        } catch (error) {
          console.error('Failed to load exercise', error);
        } finally {
          this.isLoading.set(false);
        }
      } else {
        this.isLoading.set(false);
      }
    });
  }
}
