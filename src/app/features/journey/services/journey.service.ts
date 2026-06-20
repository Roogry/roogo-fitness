import { Injectable, inject } from '@angular/core';
import { DbService } from '../../../core/services/db.service';

/**
 * Service for calculating and retrieving user journey statistics and workout streaks.
 *
 * @example
 * const stats = await journeyService.getJourneyStreakStats();
 */
@Injectable({
  providedIn: 'root',
})
export class JourneyService {
  private dbService = inject(DbService);

  /**
   * Retrieves user statistics including total sessions, current streak, and longest streak.
   *
   * @returns {Promise<any>} An object containing streak statistics and workout dates.
   *
   * @example
   * const stats = await journeyService.getJourneyStreakStats();
   * console.log(stats.currentStreak);
   */
  async getJourneyStreakStats() {
    const sessions = await this.dbService.getLoggedSessions();

    const totalSessions = sessions.length;
    if (totalSessions === 0) {
      return {
        totalSessions: 0,
        lastSession: '-',
        currentStreak: 0,
        longestStreak: 0,
        workoutDates: [] as string[],
      };
    }

    // Sort ascending for streak calculation
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    );

    const getAbsoluteWeek = (dateStr: string | Date): number => {
      const date = new Date(dateStr);
      const tempDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const day = tempDate.getDay();
      const diff = tempDate.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(tempDate.setDate(diff));
      return Math.floor(monday.getTime() / (7 * 24 * 60 * 60 * 1000));
    };

    // Extract unique absolute weeks
    const uniqueWeeks = Array.from(
      new Set(sortedSessions.map((s) => getAbsoluteWeek(s.start_time))),
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let runningStreak = 0;

    if (uniqueWeeks.length > 0) {
      runningStreak = 1;
      longestStreak = 1;
      for (let i = 1; i < uniqueWeeks.length; i++) {
        const diff = uniqueWeeks[i] - uniqueWeeks[i - 1];
        if (diff === 1) {
          runningStreak++;
        } else if (diff > 1) {
          runningStreak = 1;
        }
        if (runningStreak > longestStreak) {
          longestStreak = runningStreak;
        }
      }

      const currentWeek = getAbsoluteWeek(new Date());
      const lastWorkoutWeek = uniqueWeeks[uniqueWeeks.length - 1];
      if (currentWeek - lastWorkoutWeek <= 1) {
        currentStreak = runningStreak;
      } else {
        currentStreak = 0;
      }
    }

    // Format last session date as d/m/yy (e.g. 13/6/26)
    // Note: sessions is sorted descending, so sessions[0] is the most recent session
    const lastSessionDateObj = new Date(sessions[0].start_time);
    const day = lastSessionDateObj.getDate();
    const month = lastSessionDateObj.getMonth() + 1;
    const year = lastSessionDateObj.getFullYear().toString().slice(-2);
    const lastSession = `${day}/${month}/${year}`;

    // Expose all workout dates as simple ISO strings (YYYY-MM-DD) for calendar highlighting
    const workoutDates = sessions.map((s) => {
      const d = new Date(s.start_time);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    });

    return {
      totalSessions,
      lastSession,
      currentStreak,
      longestStreak,
      workoutDates,
    };
  }
}
