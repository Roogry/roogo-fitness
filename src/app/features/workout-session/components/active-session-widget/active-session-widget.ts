import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkoutService } from '@/core/services/workout.service';
import { DurationFormatPipe } from '@/shared/pipes/duration-format-pipe';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDumbbell, lucideActivity } from '@ng-icons/lucide';

@Component({
  selector: 'app-active-session-widget',
  standalone: true,
  imports: [CommonModule, DurationFormatPipe, NgIcon],
  providers: [provideIcons({ lucideDumbbell, lucideActivity })],
  templateUrl: './active-session-widget.html',
  styleUrl: './active-session-widget.css',
})
export class ActiveSessionWidgetComponent {
  workoutService = inject(WorkoutService);
  private router = inject(Router);

  goToActiveSession() {
    this.router.navigate(['/session/active']);
  }
}
