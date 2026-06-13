import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JourneyService } from '@/core/services/journey.service';
import { ZardCalendarGridComponent } from '@/shared/components/zard/calendar/calendar-grid.component';
import {
  generateCalendarDays,
  calendarMonths,
  makeSafeDate,
} from '@/shared/components/zard/calendar/calendar.utils';
import { JourneyStatCardComponent } from '../../components/journey-stat-card/journey-stat-card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideFlame,
  lucideTrophy,
  lucideCalendar,
  lucideDumbbell,
  lucideChevronLeft,
  lucideChevronRight,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-journey-stats',
  standalone: true,
  imports: [CommonModule, ZardCalendarGridComponent, JourneyStatCardComponent, NgIcon],
  providers: [
    provideIcons({
      lucideFlame,
      lucideTrophy,
      lucideCalendar,
      lucideDumbbell,
      lucideChevronLeft,
      lucideChevronRight,
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

  // Custom Calendar state
  currentDate = signal<Date>(new Date());
  currentMonth = computed(() => this.currentDate().getMonth());
  currentYear = computed(() => this.currentDate().getFullYear());
  monthName = computed(() => calendarMonths[this.currentMonth()]);

  calendarDays = computed(() => {
    return generateCalendarDays({
      year: this.currentYear(),
      month: this.currentMonth(),
      mode: 'multiple',
      selectedDates: this.workoutDates(),
      minDate: null,
      maxDate: null,
      disabled: false,
    });
  });

  onPreviousMonth() {
    const prev = makeSafeDate(this.currentYear(), this.currentMonth() - 1, 1);
    this.currentDate.set(prev);
  }

  onNextMonth() {
    const next = makeSafeDate(this.currentYear(), this.currentMonth() + 1, 1);
    this.currentDate.set(next);
  }

  // Swipe gesture handling
  private touchStartX = 0;

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent) {
    const touchEndX = event.changedTouches[0].clientX;
    const diff = touchEndX - this.touchStartX;
    const minSwipeDistance = 50; // pixels

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        this.onPreviousMonth();
      } else {
        this.onNextMonth();
      }
    }
  }

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
