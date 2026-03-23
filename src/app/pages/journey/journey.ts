import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Activity, Clock, ArrowRight } from 'lucide-angular';
import { HeaderComponent } from '@/shared/components/header/header';
import { LoggedWorkoutCardComponent } from '@/shared/components/logged-workout-card/logged-workout-card';
import { WorkoutService } from '@/shared/services/workout.service';
import { LoggedSession } from '@/shared/types/workout.types';

@Component({
  selector: 'app-journey',
  imports: [CommonModule, HeaderComponent, LucideAngularModule, LoggedWorkoutCardComponent],
  templateUrl: './journey.html',
  styleUrl: './journey.css',
})
export class Journey implements OnInit {
  readonly Activity = Activity;
  readonly Clock = Clock;
  readonly ArrowRight = ArrowRight;

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
