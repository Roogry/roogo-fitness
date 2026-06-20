import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ZardBadgeComponent } from '@/shared/components/zard/badge';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { ZardTooltipImports } from '@/shared/components/zard/tooltip';
import { LoggedSession } from '@/shared/models';
import { DurationFormatPipe } from '@/shared/pipes/duration-format-pipe';
import { TimeAgoPipe } from '@/shared/pipes/time-ago-pipe';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideArrowRight } from '@ng-icons/lucide';

/**
 * A card component displaying details of a logged workout session on the journey page.
 *
 * @example
 * <app-logged-workout-card [session]="mySession"></app-logged-workout-card>
 */
@Component({
  selector: 'app-logged-workout-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ZardBadgeComponent,
    ZardCardComponent,
    ZardTooltipImports,
    DurationFormatPipe,
    TimeAgoPipe,
    ZardBadgeComponent,
    NgIcon,
  ],
  providers: [provideIcons({ lucideActivity, lucideArrowRight })],
  templateUrl: './logged-workout-card.html',
})
export class LoggedWorkoutCardComponent {
  session = input.required<LoggedSession>();

  /**
   * Generates a brief summary string of the exercises performed in the session.
   *
   * @param {LoggedSession} session - The logged session data.
   * @returns {string} A summary string of exercise names.
   *
   * @example
   * const summary = this.getExerciseSummary(session); // e.g. "Squat, Bench Press & 3 more"
   */
  getExerciseSummary(session: LoggedSession): string {
    const names = new Set(session.workouts.map((w) => w.exercise.name).filter(Boolean));
    const uniqueNames = Array.from(names);
    if (uniqueNames.length === 0) return 'No exercises recorded';
    if (uniqueNames.length <= 2) return uniqueNames.join(', ');
    return `${uniqueNames[0]}, ${uniqueNames[1]} & ${uniqueNames.length - 2} more`;
  }
}
