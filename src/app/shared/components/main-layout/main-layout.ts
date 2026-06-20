import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNav } from '../bottom-nav/bottom-nav';
import { WorkoutService } from '@/core/services/workout.service';
import { ActiveSessionWidgetComponent } from '@/features/session-active/components/active-session-widget/active-session-widget';

/**
 * Main application layout that includes the router outlet, bottom navigation, and active session widget.
 * 
 * @example
 * <app-main-layout></app-main-layout>
 */
@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, BottomNav, ActiveSessionWidgetComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  workoutService = inject(WorkoutService);
}
