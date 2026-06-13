import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { RecentExercise } from '../../components/recent-exercise/recent-exercise';

@Component({
  selector: 'app-exercise-journey',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    RecentExercise,
  ],
  templateUrl: './exercise-journey.html',
})
export class ExerciseJourney {
  highestWeight = input.required<number>();
  totalSets = input.required<number>();
  recentSessions = input.required<any[]>();
}
