import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { WorkoutService } from '@/core/services/workout.service';
import { DbService } from '@/core/services/db.service';
import { LoggedWorkoutCardComponent } from '@/features/journey/pages/components/logged-workout-card/logged-workout-card';
import { UpcomingSessionCardComponent } from '@/features/home/components/upcoming-session-card/upcoming-session-card';
import { ExplorePlanCardComponent } from '@/features/home/components/explore-plan-card/explore-plan-card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDumbbell, lucideFlame, lucideCalendar } from '@ng-icons/lucide';
import { LoggedSession, WorkoutPlan } from '@/shared/models/workout.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    RouterLink,
    LoggedWorkoutCardComponent,
    UpcomingSessionCardComponent,
    ExplorePlanCardComponent,
    NgIcon,
  ],
  providers: [provideIcons({ lucideDumbbell, lucideFlame, lucideCalendar })],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  workoutService = inject(WorkoutService);
  dbService = inject(DbService);

  recentSessions = signal<LoggedSession[]>([]);
  activePlan = signal<WorkoutPlan | null>(null);

  mappedSessions = computed(() => {
    const plan = this.activePlan();
    if (!plan) return [];

    return plan.sessions.slice(0, 3);
  });

  async ngOnInit() {
    try {
      const allSessions = await this.workoutService.getLoggedWorkoutSessions();
      // Only grab the last 2 sessions
      this.recentSessions.set(allSessions.slice(0, 2));

      const plans = await this.dbService.getWorkoutPlans();
      const active = plans.find((p) => p.isActive) || (plans.length > 0 ? plans[0] : null);
      if (active) {
        this.activePlan.set(active);
      }
    } catch (e) {
      console.error('Failed to fetch home data', e);
    }
  }

  otherPlans = [
    { id: 101, title: 'Bro Split', sessions_per_week: 5, difficulty: 'Intermediate' },
    { id: 102, title: 'Full Body Fundamentals', sessions_per_week: 3, difficulty: 'Beginner' },
    { id: 103, title: 'Upper/Lower Power', sessions_per_week: 4, difficulty: 'Advanced' },
  ];
}
