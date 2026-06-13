import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHistory, lucideFlame, lucideCalendar } from '@ng-icons/lucide';

@Component({
  selector: 'app-exercise-journey',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideHistory,
      lucideFlame,
      lucideCalendar,
    }),
  ],
  templateUrl: './exercise-journey.html',
})
export class ExerciseJourney {
  highestWeight = input.required<number>();
  totalSets = input.required<number>();
  recentSessions = input.required<any[]>();
}
