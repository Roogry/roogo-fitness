import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideFolder, lucidePlus } from '@ng-icons/lucide';
import { LoggedWorkoutCardComponent } from '@/features/journey/components/logged-workout-card/logged-workout-card';
import { WorkoutService } from '@/core/services/workout.service';
import { LoggedSession } from '@/shared/models';
import { ZardButtonComponent } from '@/shared/components/zard/button';

@Component({
  selector: 'app-journey-history',
  standalone: true,
  imports: [CommonModule, LoggedWorkoutCardComponent, NgIcon, ZardButtonComponent],
  providers: [provideIcons({ lucideActivity, lucideFolder, lucidePlus })],
  templateUrl: './journey-history.html',
})
export class JourneyHistoryComponent implements OnInit {
  protected readonly journey = signal<LoggedSession[]>([]);
  protected readonly isLoading = signal<boolean>(true);

  private router = inject(Router);
  private workoutService = inject(WorkoutService);

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

  goToPlans() {
    this.router.navigate(['/plan']);
  }

  startEmptyWorkout() {
    this.workoutService.startSessionFlow(null, null);
  }
}
