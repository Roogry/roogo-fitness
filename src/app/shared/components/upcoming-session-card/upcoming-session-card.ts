import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronRight } from 'lucide-angular';
import { ZardButtonComponent } from '@/shared/components/button/button.component';

export interface UpcomingSession {
  id: number;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-upcoming-session-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ZardButtonComponent],
  templateUrl: './upcoming-session-card.html',
  host: {
    class: 'block min-w-[240px] snap-start'
  }
})
export class UpcomingSessionCardComponent {
  readonly ChevronRight = ChevronRight;

  session = input.required<UpcomingSession>();
}
