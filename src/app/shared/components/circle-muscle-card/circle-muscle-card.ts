import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';
import { DEFAULT_MUSCLE_ICON } from '@/shared/constants/muscle.constants';
import { Muscle } from '@/shared/models';
import { muscleIconUrl } from '@/shared/utils/muscle.utils';

@Component({
  selector: 'app-circle-muscle-card',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RouterModule, NgIcon],
  providers: [
    provideIcons({
      lucideCheck,
    }),
  ],
  templateUrl: './circle-muscle-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CircleMuscleCardComponent {
  readonly muscle = input.required<Muscle>();
  readonly selected = input(false);

  /**
   * A broken file falls back once. The flag resets when the muscle changes,
   * so a failed placeholder cannot loop and the next muscle can try its own icon.
   */
  private readonly iconFailed = linkedSignal(() => {
    this.muscle();
    return false;
  });

  readonly iconUrl = computed(() => {
    if (this.iconFailed()) return DEFAULT_MUSCLE_ICON;
    return muscleIconUrl(this.muscle());
  });

  onIconError(): void {
    this.iconFailed.set(true);
  }
}
