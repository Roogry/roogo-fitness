import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JourneyService } from '@/core/services/journey.service';
import { ZardCalendarComponent } from '@/shared/components/calendar';
import { JourneyStatCardComponent } from '../../components/journey-stat-card/journey-stat-card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFlame, lucideTrophy, lucideCalendar, lucideDumbbell } from '@ng-icons/lucide';

@Component({
  selector: 'app-journey-stats',
  standalone: true,
  imports: [
    CommonModule,
    ZardCalendarComponent,
    JourneyStatCardComponent,
  ],
  providers: [
    provideIcons({
      lucideFlame,
      lucideTrophy,
      lucideCalendar,
      lucideDumbbell,
    }),
  ],
  templateUrl: './journey-stats.html',
})
export class JourneyStatsComponent implements OnInit {
  private journeyService = inject(JourneyService);

  totalSessions = signal<number>(0);
  lastSession = signal<string>('-');
  currentStreak = signal<number>(0);
  longestStreak = signal<number>(0);
  workoutDates = signal<Date[]>([]);
  isLoading = signal<boolean>(true);

  async ngOnInit() {
    try {
      this.isLoading.set(true);
      const stats = await this.journeyService.getJourneyStreakStats();
      this.totalSessions.set(stats.totalSessions);
      this.lastSession.set(stats.lastSession);
      this.currentStreak.set(stats.currentStreak);
      this.longestStreak.set(stats.longestStreak);
      
      // Map ISO string dates (YYYY-MM-DD) to Date objects
      const dates = stats.workoutDates.map((dateStr) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
      });
      this.workoutDates.set(dates);
    } catch (error) {
      console.error('Failed to load streak stats', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
