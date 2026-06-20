import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { ZardBadgeComponent } from '@/shared/components/zard/badge';
import { Exercise } from '@/shared/models';
import { ExerciseMediaComponent } from '../../components/exercise-media/exercise-media';

@Component({
  selector: 'app-exercise-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    ZardCardComponent,
    ZardBadgeComponent,
    ExerciseMediaComponent,
  ],
  templateUrl: './exercise-overview.html',
})
export class ExerciseOverview {
  exercise = input.required<Exercise>();
  recommendations = input<Exercise[]>([]);
}
