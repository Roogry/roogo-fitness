import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardCardComponent } from '@/shared/components/card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendar } from '@ng-icons/lucide';

export interface ExplorePlan {
  id: number;
  title: string;
  sessions_per_week: number;
  difficulty: string;
}

@Component({
  selector: 'app-explore-plan-card',
  standalone: true,
  imports: [CommonModule, ZardCardComponent, NgIcon],
  providers: [provideIcons({ lucideCalendar })],
  templateUrl: './explore-plan-card.html',
  host: {
    class: 'block min-w-[320px] snap-start',
  },
})
export class ExplorePlanCardComponent {
  plan = input.required<ExplorePlan>();
}
