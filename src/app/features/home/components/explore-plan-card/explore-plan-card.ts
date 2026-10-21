import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendar } from '@ng-icons/lucide';
import { ExplorePlan } from './explore-plan-card.types';

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
