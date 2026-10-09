import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSkipForward, lucideTimer } from '@ng-icons/lucide';
import { WorkoutService } from '@/core/services/workout.service';
import { ZardButtonComponent } from '@/shared/components/zard/button';

/**
 * Rest countdown row shared by the session page and the floating widget.
 * Button clicks stop propagation so a parent click (widget navigation) does not fire.
 *
 * @example
 * <app-rest-timer-bar />
 */
@Component({
  selector: 'app-rest-timer-bar',
  imports: [NgIcon, ZardButtonComponent],
  providers: [provideIcons({ lucideTimer, lucideSkipForward })],
  templateUrl: './rest-timer-bar.html',
  styleUrl: './rest-timer-bar.css',
  host: { class: 'block' },
})
export class RestTimerBar {
  workoutService = inject(WorkoutService);

  addRestTime(event: Event) {
    event.stopPropagation();
    this.workoutService.addRestTime(15);
  }

  skipRest(event: Event) {
    event.stopPropagation();
    this.workoutService.skipRestTimer();
  }
}
