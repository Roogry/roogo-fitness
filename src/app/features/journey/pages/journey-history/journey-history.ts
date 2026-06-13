import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity } from '@ng-icons/lucide';
import { LoggedWorkoutCardComponent } from '@/features/journey/components/logged-workout-card/logged-workout-card';
import { WorkoutService } from '@/core/services/workout.service';
import { LoggedSession } from '@/shared/models/workout.model';

@Component({
  selector: 'app-journey-history',
  standalone: true,
  imports: [CommonModule, LoggedWorkoutCardComponent, NgIcon],
  providers: [provideIcons({ lucideActivity })],
  templateUrl: './journey-history.html',
})
export class JourneyHistoryComponent implements OnInit {
  protected readonly journey = signal<LoggedSession[]>([]);
  protected readonly isLoading = signal<boolean>(true);

  constructor(private workoutService: WorkoutService) {}

  async ngOnInit() {
    try {
      this.isLoading.set(true);
      const sessions = await this.workoutService.getLoggedWorkoutSessions();
      this.journey.set(sessions);
    } catch (e) {
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }
}
