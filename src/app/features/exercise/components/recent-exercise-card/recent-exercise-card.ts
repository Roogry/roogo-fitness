import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendar } from '@ng-icons/lucide';

/**
 * A card component displaying a recent exercise session for quick reference.
 *
 * @property {any} session - The recent session data to display.
 *
 * @example
 * <app-recent-exercise-card [session]="mySession"></app-recent-exercise-card>
 */
@Component({
  selector: 'app-recent-exercise-card',
  standalone: true,
  imports: [CommonModule, ZardCardComponent, NgIcon],
  providers: [
    provideIcons({
      lucideCalendar,
    }),
  ],
  templateUrl: './recent-exercise-card.html',
})
export class RecentExerciseCardComponent {
  session = input.required<any>();
}
