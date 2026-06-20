import { Component, inject, numberAttribute, booleanAttribute, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronRight } from '@ng-icons/lucide';

/**
 * A card component displaying an upcoming workout session for the user's active plan.
 *
 * @property {number} planId - The ID of the workout plan.
 * @property {number} sessionId - The ID of the specific session.
 * @property {string} title - The title of the session.
 * @property {boolean} isUpNext - True if this is the immediate next session for the user.
 *
 * @example
 * <app-upcoming-session-card [planId]="1" [sessionId]="2" title="Push Day" [isUpNext]="true"></app-upcoming-session-card>
 */
@Component({
  selector: 'app-upcoming-session-card',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({ lucideChevronRight })],
  templateUrl: './upcoming-session-card.html',
  host: {
    class: 'block min-w-[240px] snap-start',
  },
})
export class UpcomingSessionCardComponent {
  private router = inject(Router);

  readonly planId = input.required<number, unknown>({ transform: numberAttribute });
  readonly sessionId = input.required<number, unknown>({ transform: numberAttribute });
  readonly title = input.required<string>();
  readonly isUpNext = input.required<boolean, unknown>({ transform: booleanAttribute });

  /**
   * Navigates the user to the details page for this specific session.
   *
   * @example
   * // Triggered on user click
   * this.goToSession();
   */
  goToSession() {
    const planId = this.planId();
    const sessionId = this.sessionId();
    if (planId && sessionId) {
      this.router.navigate(['/plan', planId, 'session', sessionId]);
    }
  }
}
