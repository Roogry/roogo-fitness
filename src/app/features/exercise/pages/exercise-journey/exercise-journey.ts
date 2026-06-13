import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { RecentExerciseCardComponent } from '../../components/recent-exercise-card/recent-exercise-card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFlame } from '@ng-icons/lucide';

@Component({
  selector: 'app-exercise-journey',
  standalone: true,
  imports: [CommonModule, ZardCardComponent, RecentExerciseCardComponent, NgIcon],
  providers: [
    provideIcons({
      lucideFlame,
    }),
  ],
  templateUrl: './exercise-journey.html',
})
export class ExerciseJourney {
  highestWeight = input.required<number>();
  totalSets = input.required<number>();
  recentSessions = input.required<any[]>();
}
