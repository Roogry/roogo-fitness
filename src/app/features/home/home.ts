import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { WorkoutService } from '@/core/services/workout.service';
import { DbService } from '@/core/services/db.service';
import { LoggedWorkoutCardComponent } from '@/features/journey/pages/components/logged-workout-card/logged-workout-card';
import { UpcomingSessionCardComponent } from '@/features/home/components/upcoming-session-card/upcoming-session-card';
import { ExplorePlanCardComponent } from '@/features/home/components/explore-plan-card/explore-plan-card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDumbbell, lucideFlame, lucideCalendar } from '@ng-icons/lucide';
import { LoggedSession, WorkoutPlan } from '@/shared/models/workout.model';
import { ZardDialogService } from '@/shared/components/zard/dialog';

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
  router = inject(Router);
  workoutService = inject(WorkoutService);
  dbService = inject(DbService);
  dialogService = inject(ZardDialogService);

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

  startEmptyWorkout() {
    if (this.workoutService.sessionStartTime()) {
      this.dialogService.create({
        zTitle: 'Active Workout Session',
        zDescription: 'You already have an active workout session running.',
        zContent: 'Are you sure you want to start a new workout? This will permanently delete your current active session data.',
        zOkText: 'Start New',
        zOkDestructive: true,
        zCancelText: 'Cancel',
        zOnOk: () => {
          this.workoutService.clearSession();
          this.router.navigate(['/session/active']);
        }
      });
    } else {
      this.router.navigate(['/session/active']);
    }
  }
}
