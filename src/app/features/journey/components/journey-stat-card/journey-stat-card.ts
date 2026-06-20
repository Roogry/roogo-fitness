import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';

/**
 * A card component displaying a specific statistic in the user's journey.
 *
 * @property {string} icon - The icon identifier to display.
 * @property {string} title - The title of the statistic.
 * @property {string | number} value - The numeric or string value of the statistic.
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
