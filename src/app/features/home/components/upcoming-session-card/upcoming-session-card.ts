import { Component, inject, numberAttribute, Input, booleanAttribute } from '@angular/core';
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

  @Input({ transform: numberAttribute }) planId!: number;
  @Input({ transform: numberAttribute }) sessionId!: number;
  @Input() title!: string;
  @Input({ transform: booleanAttribute }) isUpNext!: boolean;

  goToSession() {
    if (this.planId && this.sessionId) {
      this.router.navigate(['/plan', this.planId, 'session', this.sessionId]);
    }
  }
}
