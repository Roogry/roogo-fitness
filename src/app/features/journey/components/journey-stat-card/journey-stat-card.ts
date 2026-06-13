import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';

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
