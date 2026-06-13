import { Component, input, signal, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideDumbbell,
  lucideChevronLeft,
  lucideChevronRight,
} from '@ng-icons/lucide';
import { ExerciseMedia } from '@/shared/models/workout.model';

@Component({
  selector: 'app-exercise-media',
  standalone: true,
  imports: [
    CommonModule,
    ZardButtonComponent,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideDumbbell,
      lucideChevronLeft,
      lucideChevronRight,
    }),
  ],
  templateUrl: './exercise-media.html',
})
export class ExerciseMediaComponent {
  private sanitizer = inject(DomSanitizer);

  media = input.required<ExerciseMedia[]>();
  imageError = false;
  activeMediaIndex = signal(0);

  activeSafeUrl = computed(() => {
    const list = this.media();
    const idx = this.activeMediaIndex();
    if (!list || list.length === 0) return null;

    const item = list[idx];
    let url = item.media_url;

    // Convert standard YouTube watch URLs to embed URLs format
    if (item.media_type === 'youtube') {
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
    const list = this.media() || [];
    this.activeMediaIndex.update((i) => (i + 1) % list.length);
  }

  prevMedia() {
    const list = this.media() || [];
    this.activeMediaIndex.update((i) => (i === 0 ? list.length - 1 : i - 1));
  }
}
