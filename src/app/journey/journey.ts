import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/components/header/header';
import { LucideAngularModule, Activity, Clock, ArrowRight } from 'lucide-angular';
import { WorkoutService, LoggedWorkoutSession } from '../shared/services/workout';
import { ZardCardComponent } from '@/shared/components/card';

@Component({
  selector: 'app-journey',
  imports: [CommonModule, HeaderComponent, LucideAngularModule, ZardCardComponent],
  templateUrl: './journey.html',
  styleUrl: './journey.css',
})
export class Journey implements OnInit {
  readonly Activity = Activity;
  readonly Clock = Clock;
  readonly ArrowRight = ArrowRight;

  protected readonly history = signal<LoggedWorkoutSession[]>([]);
  protected readonly isLoading = signal<boolean>(true);

  constructor(private workoutService: WorkoutService) {}

  async ngOnInit() {
    try {
      this.isLoading.set(true);
      const sessions = await this.workoutService.getLoggedWorkoutSessions();
      this.history.set(sessions);
    } catch (e) {
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }

  getTotalSets(session: LoggedWorkoutSession): number {
    return session.workouts.reduce((total, w) => total + (w.sets?.length || 0), 0);
  }

  getExerciseSummary(session: LoggedWorkoutSession): string {
    const names = new Set(session.workouts.map(w => w.workout_title).filter(Boolean));
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
