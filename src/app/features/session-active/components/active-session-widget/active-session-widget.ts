import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkoutService } from '@/core/services/workout.service';
import { DurationFormatPipe } from '@/shared/pipes/duration-format-pipe';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDumbbell, lucideFlame } from '@ng-icons/lucide';
import { ZardBadgeComponent } from '@/shared/components/zard/badge';
import { timeFormatPipe } from '../../../../shared/pipes/time-format-pipe';
import { RestTimerBar } from '../rest-timer-bar/rest-timer-bar';

@Component({
  selector: 'app-active-session-widget',
  standalone: true,
  imports: [
    CommonModule,
    DurationFormatPipe,
    NgIcon,
    ZardBadgeComponent,
    timeFormatPipe,
    RestTimerBar,
  ],
  providers: [provideIcons({ lucideDumbbell, lucideFlame })],
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
