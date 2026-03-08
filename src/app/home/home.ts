import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardButtonComponent } from '../shared/components/button/button.component';
import { ZardCardComponent } from '@/shared/components/card';
import { WorkoutService, LoggedWorkoutSession } from '../shared/services/workout';
import {
  LucideAngularModule,
  Dumbbell,
  Play,
  Calendar,
  ChevronRight,
  Flame,
  Clock,
  Activity
} from 'lucide-angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ZardButtonComponent, ZardCardComponent, LucideAngularModule, RouterLink],
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
  recentSessions = signal<LoggedWorkoutSession[]>([]);

  async ngOnInit() {
    try {
      const allSessions = await this.workoutService.getLoggedWorkoutSessions();
      // Only grab the last 2 sessions
      this.recentSessions.set(allSessions.slice(0, 2));
    } catch (e) {
      console.error('Failed to fetch recent sessions', e);
    }
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
