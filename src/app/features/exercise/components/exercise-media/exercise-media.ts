import { Component, input, signal, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDumbbell, lucideChevronLeft, lucideChevronRight } from '@ng-icons/lucide';
import { ExerciseMedia } from '@/shared/models';

/**
 * A component displaying media content (images/videos) for a specific exercise.
 *
 * @property {ExerciseMedia[]} media - The list of media content to display.
 *
 * @example
 * <app-exercise-media [media]="exercise.media"></app-exercise-media>
 */
@Component({
  selector: 'app-exercise-media',
  standalone: true,
  imports: [CommonModule, ZardButtonComponent, NgIcon],
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

  /**
   * Advances the display to the next media item in the list.
   *
   * @example
   * this.nextMedia();
   */
  nextMedia() {
    const list = this.media() || [];
    this.activeMediaIndex.update((i) => (i + 1) % list.length);
  }

  /**
   * Returns the display to the previous media item in the list.
   *
   * @example
   * this.prevMedia();
   */
  prevMedia() {
    const list = this.media() || [];
    this.activeMediaIndex.update((i) => (i === 0 ? list.length - 1 : i - 1));
  }
}
