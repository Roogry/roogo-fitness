import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, ChevronRight } from 'lucide-angular';

export interface UpcomingSession {
  id: number;
  planId?: number;
  sessionId?: number;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-upcoming-session-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './upcoming-session-card.html',
  host: {
    class: 'block min-w-[240px] snap-start'
  }
})
export class UpcomingSessionCardComponent {
  readonly ChevronRight = ChevronRight;
  private router = inject(Router);

  session = input.required<UpcomingSession>();

  goToSession() {
    const s = this.session();
    if (s.planId && s.sessionId) {
      this.router.navigate(['/session/detail'], { queryParams: { planId: s.planId, sessionId: s.sessionId } });
    }
  }
}
