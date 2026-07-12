import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { WorkoutService } from '@/core/services/workout.service';
import { DbService } from '@/core/services/db.service';
import { UpcomingSessionCardComponent } from '@/features/home/components/upcoming-session-card/upcoming-session-card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDumbbell, lucideFlame, lucideCalendar } from '@ng-icons/lucide';
import { LoggedSession, WorkoutPlan, Muscle } from '@/shared/models';
import { HomeLoggedWorkoutCardComponent } from './components/home-logged-workout-card/home-logged-workout-card';
import { MuscleService } from '@/core/services/muscle.service';
import { CircleMuscleCardComponent } from '@/shared/components/circle-muscle-card/circle-muscle-card';
import { JourneyService } from '@/features/journey/services/journey.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    RouterLink,
    HomeLoggedWorkoutCardComponent,
    CircleMuscleCardComponent,
    UpcomingSessionCardComponent,
    NgIcon,
  ],
  providers: [provideIcons({ lucideDumbbell, lucideFlame, lucideCalendar })],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  router = inject(Router);
  dbService = inject(DbService);
  workoutService = inject(WorkoutService);
  muscleService = inject(MuscleService);
  journeyService = inject(JourneyService);

  recentSessions = signal<LoggedSession[]>([]);
  activePlan = signal<WorkoutPlan | null>(null);
  muscles = signal<Muscle[]>([]);
  daysTrainedThisWeek = signal<number>(0);

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

      // Calculate days trained this week using journeyService
      const days = await this.journeyService.getDaysTrainedThisWeek();
      this.daysTrainedThisWeek.set(days);

      const plans = await this.dbService.getWorkoutPlans();
      const active = plans.find((p) => p.isActive) || (plans.length > 0 ? plans[0] : null);
      if (active) {
        this.activePlan.set(active);
      }

      const allMuscles = await this.muscleService.getMuscles();
      this.muscles.set(allMuscles);
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
