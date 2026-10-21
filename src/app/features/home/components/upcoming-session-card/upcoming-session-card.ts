import { Component, inject, numberAttribute, booleanAttribute, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronRight } from '@ng-icons/lucide';

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

  goToSession() {
    const planId = this.planId();
    const sessionId = this.sessionId();
    if (planId && sessionId) {
      this.router.navigate(['/plan', planId, 'session', sessionId]);
    }
  }
}
