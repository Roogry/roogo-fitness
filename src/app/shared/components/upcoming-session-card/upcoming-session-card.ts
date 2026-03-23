import { Component, input, inject, numberAttribute, Input, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, ChevronRight } from 'lucide-angular';

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

  @Input({ transform: numberAttribute }) planId!: number;
  @Input({ transform: numberAttribute }) sessionId!: number;
  @Input() title!: string;
  @Input({ transform: booleanAttribute }) isUpNext!: boolean;

  goToSession() {
    if (this.planId && this.sessionId) {
      this.router.navigate(['/session/detail'], { queryParams: { planId: this.planId, sessionId: this.sessionId } });
    }
  }
}

