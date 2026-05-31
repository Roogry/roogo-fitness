import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity } from '@ng-icons/lucide';
import { HeaderComponent } from '@/shared/components/header/header';
import { LoggedWorkoutCardComponent } from '@/features/journey/pages/components/logged-workout-card/logged-workout-card';
import { WorkoutService } from '@/core/services/workout.service';
import { LoggedSession } from '@/shared/models/workout.model';

@Component({
  selector: 'app-journey',
  imports: [CommonModule, HeaderComponent, LoggedWorkoutCardComponent, NgIcon],
  providers: [provideIcons({ lucideActivity })],
  templateUrl: './journey-list.html',
})
export class JourneyList implements OnInit {
  protected readonly journey = signal<LoggedSession[]>([]);
  protected readonly isLoading = signal<boolean>(true);

  constructor(private workoutService: WorkoutService) { }

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
