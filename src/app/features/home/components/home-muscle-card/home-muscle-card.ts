import { Component, input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Muscle } from '@/shared/models';

@Component({
  selector: 'app-home-muscle-card',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RouterModule],
  templateUrl: './home-muscle-card.html',
})
export class HomeMuscleCardComponent {
  muscle = input.required<Muscle>();
}
