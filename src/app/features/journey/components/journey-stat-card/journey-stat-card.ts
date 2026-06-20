import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';

/**
 * A card component displaying a specific statistic in the user's journey.
 *
 * @example
 * <app-journey-stat-card icon="activity" title="Total Workouts" [value]="42"></app-journey-stat-card>
 */
@Component({
  selector: 'app-journey-stat-card',
  standalone: true,
  imports: [CommonModule, NgIcon],
  templateUrl: './journey-stat-card.html',
})
export class JourneyStatCardComponent {
  icon = input.required<string>();
  title = input.required<string>();
  value = input.required<string | number>();
}
