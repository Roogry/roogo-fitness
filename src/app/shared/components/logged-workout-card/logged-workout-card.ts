import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ZardBadgeComponent } from '@/shared/components/badge';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardTooltipImports } from '@/shared/components/tooltip';
import { LoggedSession } from '@/shared/types/workout.types';
import { DurationFormatPipe } from '@/shared/pipes/duration-format-pipe';
import { TimeAgoPipe } from '@/shared/pipes/time-ago-pipe';
import { LucideAngularModule, Activity, Clock, ArrowRight } from 'lucide-angular';

@Component({
  selector: 'app-logged-workout-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ZardBadgeComponent,
    ZardCardComponent,
    ZardTooltipImports,
    LucideAngularModule,
    DurationFormatPipe,
    TimeAgoPipe,
    ZardBadgeComponent,
  ],
  templateUrl: './logged-workout-card.html',
})
export class LoggedWorkoutCardComponent {
  readonly Activity = Activity;
  readonly Clock = Clock;
  readonly ArrowRight = ArrowRight;

  session = input.required<LoggedSession>();

  getExerciseSummary(session: LoggedSession): string {
    const names = new Set(session.workouts.map((w) => w.exercise.name).filter(Boolean));
    const uniqueNames = Array.from(names);
    if (uniqueNames.length === 0) return 'No exercises recorded';
    if (uniqueNames.length <= 2) return uniqueNames.join(', ');
    return `${uniqueNames[0]}, ${uniqueNames[1]} & ${uniqueNames.length - 2} more`;
  }
}
