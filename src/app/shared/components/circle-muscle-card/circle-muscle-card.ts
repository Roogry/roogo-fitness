import { Component, input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';
import { Muscle } from '@/shared/models';

@Component({
  selector: 'app-circle-muscle-card',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RouterModule, NgIcon],
  providers: [
    provideIcons({
      lucideCheck,
    }),
  ],
  templateUrl: './circle-muscle-card.html',
})
export class CircleMuscleCardComponent {
  muscle = input.required<Muscle>();
  selected = input<boolean>(false);
}
