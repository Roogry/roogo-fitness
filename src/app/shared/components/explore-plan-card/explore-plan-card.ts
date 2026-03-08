import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardCardComponent } from '@/shared/components/card';
import { LucideAngularModule, Calendar } from 'lucide-angular';

export interface ExplorePlan {
  id: number;
  title: string;
  sessions_per_week: number;
  difficulty: string;
}

@Component({
  selector: 'app-explore-plan-card',
  standalone: true,
  imports: [CommonModule, ZardCardComponent, LucideAngularModule],
  templateUrl: './explore-plan-card.html',
  host: {
    class: 'block min-w-[320px] snap-start'
  }
})
export class ExplorePlanCardComponent {
  readonly Calendar = Calendar;

  plan = input.required<ExplorePlan>();
}
