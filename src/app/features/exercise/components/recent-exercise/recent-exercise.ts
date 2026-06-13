import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFlame, lucideCalendar } from '@ng-icons/lucide';

@Component({
  selector: 'app-recent-exercise',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideFlame,
      lucideCalendar,
    }),
  ],
  templateUrl: './recent-exercise.html',
})
export class RecentExercise {
  recentSessions = input.required<any[]>();
}
