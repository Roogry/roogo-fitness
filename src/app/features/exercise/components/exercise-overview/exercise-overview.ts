import { Component, input, signal, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { ZardBadgeComponent } from '@/shared/components/zard/badge';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideDumbbell,
  lucideChevronLeft,
  lucideChevronRight,
} from '@ng-icons/lucide';
import { Exercise } from '@/shared/models/workout.model';

@Component({
  selector: 'app-exercise-overview',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardBadgeComponent,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideDumbbell,
      lucideChevronLeft,
      lucideChevronRight,
    }),
  ],
  templateUrl: './exercise-overview.html',
})
export class ExerciseOverview {
  private sanitizer = inject(DomSanitizer);

  exercise = input.required<Exercise>();
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
}
