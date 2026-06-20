import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ZardButtonComponent } from '@/shared/components/zard/button/button.component';
import { ZardInputDirective } from '@/shared/components/zard/input/input.directive';
import {
  lucideVideo,
  lucideChevronUp,
  lucideChevronDown,
  lucideTrash2,
  lucidePlus,
} from '@ng-icons/lucide';
import { ExerciseMedia } from '@/shared/models';

/**
 * A component for managing the media (videos/images) associated with an exercise.
 *
 * @property {ExerciseMedia[]} media - The current list of media associated with the exercise.
 * @property {string} addMedia - Event emitted with the URL of new media to add.
 * @property {number} removeMedia - Event emitted with the index of media to remove.
 * @property {number} moveMediaUp - Event emitted with the index of media to move up.
 * @property {number} moveMediaDown - Event emitted with the index of media to move down.
 *
 * @example
 * <app-exercise-media-management [media]="mediaList"></app-exercise-media-management>
 */
@Component({
  selector: 'app-exercise-media-management',
  standalone: true,
  imports: [CommonModule, NgIcon, ZardButtonComponent, ZardInputDirective],
  providers: [
    provideIcons({
      lucideVideo,
      lucideChevronUp,
      lucideChevronDown,
      lucideTrash2,
      lucidePlus,
    }),
  ],
  templateUrl: './exercise-media-management.html',
})
export class ExerciseMediaManagement {
  media = input.required<ExerciseMedia[]>();

  addMedia = output<string>();
  removeMedia = output<number>();
  moveMediaUp = output<number>();
  moveMediaDown = output<number>();

  newMediaUrl = signal('');

  /**
   * Emits an event to add a new media URL.
   *
   * @example
   * this.onAdd();
   */
  onAdd() {
    const url = this.newMediaUrl().trim();
    if (!url) return;
    this.addMedia.emit(url);
    this.newMediaUrl.set('');
  }

  /**
   * Emits an event to remove a media item at a specific index.
   *
   * @param {number} index - The index of the media item to remove.
   *
   * @example
   * this.onRemove(1);
   */
  onRemove(index: number) {
    this.removeMedia.emit(index);
  }

  /**
   * Emits an event to move a media item up in the display order.
   *
   * @param {number} index - The current index of the media item.
   *
   * @example
   * this.onMoveUp(2);
   */
  onMoveUp(index: number) {
    this.moveMediaUp.emit(index);
  }

  /**
   * Emits an event to move a media item down in the display order.
   *
   * @param {number} index - The current index of the media item.
   *
   * @example
   * this.onMoveDown(0);
   */
  onMoveDown(index: number) {
    this.moveMediaDown.emit(index);
  }
}
