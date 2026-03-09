import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ZardCardComponent } from '@/shared/components/card';
import { WorkoutService } from '@/shared/services/workout.service';
import { LoggedWorkoutCardComponent } from '@/shared/components/logged-workout-card/logged-workout-card';
import { UpcomingSessionCardComponent } from '@/shared/components/upcoming-session-card/upcoming-session-card';
import { ExplorePlanCardComponent } from '@/shared/components/explore-plan-card/explore-plan-card';
import {
  LucideAngularModule,
  Dumbbell,
  Play,
  Calendar,
  ChevronRight,
  Flame,
  Clock,
  Activity,
} from 'lucide-angular';
import { LoggedSession } from '@/shared/types/workout.types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    LucideAngularModule,
    RouterLink,
    LoggedWorkoutCardComponent,
    UpcomingSessionCardComponent,
    ExplorePlanCardComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  readonly Dumbbell = Dumbbell;
  readonly Play = Play;
  readonly Calendar = Calendar;
  readonly ChevronRight = ChevronRight;
  readonly Flame = Flame;
  readonly Clock = Clock;
  readonly Activity = Activity;
  readonly ArrowRight = ChevronRight; // Reuse icon

  workoutService = inject(WorkoutService);
  recentSessions = signal<LoggedSession[]>([]);

  async ngOnInit() {
    try {
      const allSessions = await this.workoutService.getLoggedWorkoutSessions();
      // Only grab the last 2 sessions
      this.recentSessions.set(allSessions.slice(0, 2));
    } catch (e) {
      console.error('Failed to fetch recent sessions', e);
    }
  }

  upcomingSessions = [
    { id: 1, title: 'Push Day Heavy', subtitle: 'Up Next' },
    { id: 2, title: 'Pull Day Focus', subtitle: 'Later' },
    { id: 3, title: 'Leg Day Volume', subtitle: 'Coming Soon' },
  ];

  otherPlans = [
    { id: 101, title: 'Bro Split', sessions_per_week: 5, difficulty: 'Intermediate' },
    { id: 102, title: 'Full Body Fundamentals', sessions_per_week: 3, difficulty: 'Beginner' },
    { id: 103, title: 'Upper/Lower Power', sessions_per_week: 4, difficulty: 'Advanced' },
  ];
}
