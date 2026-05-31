import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { WorkoutService } from '@/core/services/workout.service';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { HeaderComponent } from '@/shared/components/header/header';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideDumbbell,
  lucidePencil,
  lucideChevronLeft,
  lucideChevronRight,
} from '@ng-icons/lucide';
import { Exercise } from '@/shared/models/workout.model';

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    ZardCardComponent,
    ZardButtonComponent,
    HeaderComponent,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideDumbbell,
      lucidePencil,
      lucideChevronLeft,
      lucideChevronRight,
    }),
  ],
  templateUrl: './exercise-detail.html',
  styleUrl: './exercise-detail.css',
})
export class ExerciseDetail implements OnInit {
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
