import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardCardComponent } from '@/shared/components/card';
import { LucideAngularModule, Activity, Clock, ArrowRight } from 'lucide-angular';
import { LoggedSession } from '@/shared/types/workout.types';
import { DurationFormatPipe } from '@/shared/pipes/duration-format-pipe';

@Component({
  selector: 'app-logged-workout-card',
  standalone: true,
  imports: [CommonModule, ZardCardComponent, LucideAngularModule, DurationFormatPipe],
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

  formatDuration(minutes: number): string {
    if (!minutes) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? mins + 'min' : ''}`.trim();
    }
    return `${mins} min`;
  }
}
