import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { WorkoutService, Exercise } from '../../shared/services/workout';
import { ZardCardComponent } from '../../shared/components/card/card.component';
import { ZardButtonComponent } from '../../shared/components/button/button.component';
import { HeaderComponent } from '../../shared/components/header/header';
import {
  LucideAngularModule,
  ArrowLeft,
  Dumbbell,
  Activity,
  Info,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from 'lucide-angular';

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ZardCardComponent,
    ZardButtonComponent,
    HeaderComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="min-h-screen bg-background text-foreground pb-20">
      <!-- Header -->
      <app-header [title]="exercise() ? '' : 'Loading...'" [showBackBtn]="true" backLink="/">
        @if (exercise()) {
          <a
            right
            [routerLink]="['/exercise', exercise()!.id, 'edit']"
            z-button
            zType="secondary"
            zSize="icon-lg"
            zShape="circle"
            title="Edit Exercise"
          >
            <lucide-icon [img]="Pencil"></lucide-icon>
            <span class="sr-only">Edit</span>
          </a>
        }
      </app-header>

      <main class="container mx-auto px-4 pb-8 max-w-2xl">
        @if (isLoading()) {
          <div class="flex justify-center py-12 text-muted-foreground">
            <div
              class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
            ></div>
          </div>
        } @else if (exercise()) {
          <div class="flex flex-col gap-4">
            <div class="pt-2 pb-6 flex flex-col items-center text-center">
              <div class="flex items-center gap-3 mb-2">
                <h2 class="text-3xl font-extrabold tracking-tight">{{ exercise()!.name }}</h2>
              </div>
              <div class="flex flex-wrap items-center justify-center gap-2">
                <div
                  class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground"
                >
                  Primary: {{ exercise()!.muscle_group }}
                </div>
                @if (exercise()?.secondary_muscles) {
                  <div
                    class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-muted text-muted-foreground"
                  >
                    Secondary: {{ exercise()!.secondary_muscles }}
                  </div>
                }
              </div>
            </div>

            @if (exercise()?.media && exercise()!.media.length > 0) {
              <div
                class="relative w-full aspect-video bg-muted rounded-4xl overflow-hidden border border-border flex items-center justify-center group"
              >
                @let activeMedia = exercise()!.media[activeMediaIndex()];

                @if (activeMedia.media_type === 'youtube') {
                  <iframe
                    [src]="activeSafeUrl()"
                    class="w-full h-full"
                    frameborder="0"
                    allowfullscreen
                  ></iframe>
                } @else if (activeMedia.media_type === 'video') {
                  <video
                    [src]="activeMedia.media_url"
                    class="w-full h-full object-cover"
                    controls
                    playsinline
                  ></video>
                } @else {
                  <img
                    [src]="activeMedia.media_url"
                    class="w-full h-full object-cover"
                    (error)="imageError = true"
                    [class.hidden]="imageError"
                  />
                  @if (imageError) {
                    <lucide-icon
                      [img]="Dumbbell"
                      class="h-10 w-10 text-muted-foreground"
                    ></lucide-icon>
                  }
                }

                <!-- Carousel Controls -->
                @if (exercise()!.media.length > 1) {
                  <div
                    class="absolute inset-x-0 flex justify-between items-center px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <button
                      z-button
                      zType="outline"
                      zSize="icon"
                      class="h-8 w-8 rounded-full bg-background/80 backdrop-blur"
                      (click)="prevMedia()"
                    >
                      <lucide-icon [img]="ChevronLeft" class="h-4 w-4"></lucide-icon>
                    </button>
                    <button
                      z-button
                      zType="outline"
                      zSize="icon"
                      class="h-8 w-8 rounded-full bg-background/80 backdrop-blur"
                      (click)="nextMedia()"
                    >
                      <lucide-icon [img]="ChevronRight" class="h-4 w-4"></lucide-icon>
                    </button>
                  </div>

                  <!-- Dots -->
                  <div class="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                    @for (m of exercise()!.media; track m.id; let i = $index) {
                      <div
                        class="h-1.5 w-1.5 rounded-full transition-all"
                        [class.bg-white]="activeMediaIndex() === i"
                        [class.bg-white/50]="activeMediaIndex() !== i"
                      ></div>
                    }
                  </div>
                }
              </div>
            } @else {
              <div
                class="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4"
              >
                <lucide-icon [img]="Dumbbell" class="h-10 w-10 text-primary"></lucide-icon>
              </div>
            }

            <z-card zTitle="About this exercise">
              <p class="text-muted-foreground leading-relaxed">
                This is a placeholder description for <strong>{{ exercise()!.name }}</strong
                >. In a full application, this section would contain detailed instructions, form
                cues, common mistakes, and video demonstrations for targeting the
                {{ exercise()!.muscle_group }} muscles.
              </p>
            </z-card>

            <div class="grid grid-cols-2 gap-4">
              <z-card>
                <div class="flex flex-col items-center text-center">
                  <span class="text-3xl font-bold mb-1">-</span>
                  <span class="text-xs text-muted-foreground uppercase tracking-wider">
                    Personal Record
                  </span>
                </div>
              </z-card>
              <z-card>
                <div class="flex flex-col items-center text-center">
                  <span class="text-3xl font-bold mb-1">-</span>
                  <span class="text-xs text-muted-foreground uppercase tracking-wider">
                    Times Performed
                  </span>
                </div>
              </z-card>
            </div>
          </div>
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
  readonly Pencil = Pencil;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;

  private route = inject(ActivatedRoute);
  private workoutService = inject(WorkoutService);
  private sanitizer = inject(DomSanitizer);

  exercise = signal<Exercise | undefined>(undefined);
  isLoading = signal<boolean>(true);
  imageError = false;
  activeMediaIndex = signal(0);

  activeSafeUrl = computed(() => {
    const ex = this.exercise();
    const idx = this.activeMediaIndex();
    if (!ex || !ex.media || ex.media.length === 0) return null;

    const media = ex.media[idx];
    let url = media.media_url;

    // Convert standard YouTube watch URLs to embed URLs format
    if (media.media_type === 'youtube') {
      const match = url.match(/[?&]v=([^&]+)/);
      if (match && match[1]) {
        url = `https://www.youtube.com/embed/${match[1]}`;
      } else if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1].split('?')[0];
        url = `https://www.youtube.com/embed/${id}`;
      }
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  nextMedia() {
    const media = this.exercise()?.media || [];
    this.activeMediaIndex.update((i) => (i + 1) % media.length);
  }

  prevMedia() {
    const media = this.exercise()?.media || [];
    this.activeMediaIndex.update((i) => (i === 0 ? media.length - 1 : i - 1));
  }

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
