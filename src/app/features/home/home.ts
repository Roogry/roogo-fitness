import {
  Component,
  inject,
  signal,
  OnInit,
  computed,
  ViewChild,
  ElementRef,
  HostListener,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { WorkoutService } from '@/core/services/workout.service';
import { DbService } from '@/core/services/db.service';
import { UpcomingSessionCardComponent } from '@/features/home/components/upcoming-session-card/upcoming-session-card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDumbbell, lucideFlame, lucideCalendar } from '@ng-icons/lucide';
import { LoggedSession, WorkoutPlan, WorkoutPlanSession, Muscle } from '@/shared/models';
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
export class Home implements OnInit, AfterViewInit {
  router = inject(Router);
  dbService = inject(DbService);
  workoutService = inject(WorkoutService);
  muscleService = inject(MuscleService);
  journeyService = inject(JourneyService);

  recentSessions = signal<LoggedSession[]>([]);
  activePlan = signal<WorkoutPlan | null>(null);
  muscles = signal<Muscle[]>([]);
  daysTrainedThisWeek = signal<number>(0);
  completedSessionIds = signal<Set<number>>(new Set());

  @ViewChild('scrollContainer') scrollContainer?: ElementRef<HTMLElement>;

  activePage = signal<number>(0);
  totalPages = signal<number>(1);

  pagesArray = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  });

  mappedSessions = computed(() => {
    const plan = this.activePlan();
    if (!plan) return [];

    const completed = this.completedSessionIds();
    return plan.sessions.filter((s) => !completed.has(s.id)).slice(0, 3);
  });

  nextSession = computed(() => {
    const sessions = this.mappedSessions();
    return sessions.length > 0 ? sessions[0] : null;
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
      this.updateNextSession(active, allSessions);

      const allMuscles = await this.muscleService.getMuscles();
      this.muscles.set(allMuscles);

      // Update scroll dimensions after DOM renders
      setTimeout(() => {
        if (this.scrollContainer) {
          this.updateScrollInfo(this.scrollContainer.nativeElement);
        }
      }, 100);
    } catch (e) {
      console.error('Failed to fetch home data', e);
    }
  }

  ngAfterViewInit() {
    if (this.scrollContainer) {
      this.updateScrollInfo(this.scrollContainer.nativeElement);
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.scrollContainer) {
      this.updateScrollInfo(this.scrollContainer.nativeElement);
    }
  }

  updateScrollInfo(container: HTMLElement) {
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    if (clientWidth === 0) return;

    const maxScrollLeft = scrollWidth - clientWidth;

    let total = 1;
    if (maxScrollLeft > 0) {
      // Use a 40px tolerance (half of min-w-[80px]) to prevent small gap/padding overflows from creating an extra page
      const tolerance = 40;
      total = 1 + Math.max(0, Math.ceil((maxScrollLeft - tolerance) / clientWidth));
    }

    let current = 0;
    if (maxScrollLeft > 0 && total > 1) {
      const scrollRatio = container.scrollLeft / maxScrollLeft;
      if (scrollRatio > 0.85) {
        current = Math.round(scrollRatio) * (total - 1);
      } else {
        current = Math.floor(scrollRatio) * (total - 1);
      }
    }

    if (this.totalPages() !== total) {
      this.totalPages.set(total || 1);
    }
    if (this.activePage() !== current) {
      this.activePage.set(current);
    }
  }

  onScroll(container: HTMLElement) {
    this.updateScrollInfo(container);
  }

  scrollToPage(index: number) {
    if (this.scrollContainer) {
      const container = this.scrollContainer.nativeElement;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      const total = this.totalPages();
      if (total <= 1 || maxScrollLeft <= 0) return;

      const targetScrollLeft = (index / (total - 1)) * maxScrollLeft;
      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth',
      });
    }
  }

  otherPlans = [
    { id: 101, title: 'Bro Split', sessions_per_week: 5, difficulty: 'Intermediate' },
    { id: 102, title: 'Full Body Fundamentals', sessions_per_week: 3, difficulty: 'Beginner' },
    { id: 103, title: 'Upper/Lower Power', sessions_per_week: 4, difficulty: 'Advanced' },
  ];

  updateNextSession(plan: WorkoutPlan | null, allSessions: LoggedSession[]) {
    this.activePlan.set(plan);

    if (!plan || !plan.sessions || plan.sessions.length === 0) {
      this.completedSessionIds.set(new Set());
      return;
    }

    // Get the start of this week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // Filter logged sessions to this week
    const loggedSessionsThisWeek = allSessions.filter((session) => {
      const sessionDate = new Date(session.start_time);
      return sessionDate.getTime() >= startOfWeek.getTime();
    });

    // Extract set of completed plan session IDs
    const completedSessionIds = new Set(
      loggedSessionsThisWeek
        .map((s) => s.workout_plan_session_id)
        .filter((id): id is number => id !== undefined && id !== null),
    );

    this.completedSessionIds.set(completedSessionIds);
  }
}
