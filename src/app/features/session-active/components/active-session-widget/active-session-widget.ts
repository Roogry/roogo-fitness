import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkoutService } from '@/core/services/workout.service';
import { DurationFormatPipe } from '@/shared/pipes/duration-format-pipe';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDumbbell, lucideFlame } from '@ng-icons/lucide';
import { ZardBadgeComponent } from '@/shared/components/zard/badge';
import { timeFormatPipe } from '../../../../shared/pipes/time-format-pipe';

/**
 * A floating widget component displaying the user's currently active workout session timer and status.
 *
 * @example
 * <app-active-session-widget></app-active-session-widget>
 */
@Component({
  selector: 'app-active-session-widget',
  standalone: true,
  imports: [CommonModule, DurationFormatPipe, NgIcon, ZardBadgeComponent, timeFormatPipe],
  providers: [provideIcons({ lucideDumbbell, lucideFlame })],
  templateUrl: './active-session-widget.html',
  styleUrl: './active-session-widget.css',
})
export class ActiveSessionWidgetComponent {
  workoutService = inject(WorkoutService);
  private router = inject(Router);

  /**
   * Navigates the user back to the active session view.
   *
   * @example
   * this.goToActiveSession();
   */
  goToActiveSession() {
    this.router.navigate(['/session/active']);
  }
}
