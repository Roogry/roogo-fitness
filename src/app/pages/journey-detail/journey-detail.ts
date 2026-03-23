import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutService } from '@/shared/services/workout.service';
import { LoggedSession } from '@/shared/types/workout.types';
import { DurationFormatPipe } from '@/shared/pipes/duration-format-pipe';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardCardComponent } from '@/shared/components/card';
import { HeaderComponent } from '@/shared/components/header/header';
import { ExerciseTracker } from "@/components/exercise-tracker/exercise-tracker";
import { ZardPopoverComponent, ZardPopoverDirective } from "@/shared/components/popover";
import {
  LucideAngularModule,
  ArrowLeft,
  Clock,
  Dumbbell,
  Calendar,
  Activity,
  Ellipsis,
  Pencil,
  Trash2,
} from 'lucide-angular';
import { CdkConnectedOverlay } from "@angular/cdk/overlay";

@Component({
  selector: 'app-journey-detail',
  standalone: true,
  imports: [
    CommonModule,
    DurationFormatPipe,
    ZardButtonComponent,
    ZardCardComponent,
    LucideAngularModule,
    HeaderComponent,
    ExerciseTracker,
    ZardPopoverComponent,
    ZardPopoverDirective,
    CdkConnectedOverlay
],
  templateUrl: './journey-detail.html',
})
export class JourneyDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workoutService = inject(WorkoutService);

  readonly ArrowLeft = ArrowLeft;
  readonly Clock = Clock;
  readonly Dumbbell = Dumbbell;
  readonly Calendar = Calendar;
  readonly Activity = Activity;
  readonly Ellipsis = Ellipsis;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;

  loggedSession = signal<LoggedSession | undefined>(undefined);
  pageTitle = signal<string>("Loading...");
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.loadJourney(Number(idParam));
      } else {
        this.goBack();
      }
    });
  }

  async loadJourney(id: number) {
    this.pageTitle.set('Loading...');
    try {
      this.isLoading.set(true);
      const LoggedSession = await this.workoutService.getLoggedSession(id);
      
      this.loggedSession.set(LoggedSession);
      this.pageTitle.set(LoggedSession?.session_title?? 'Not Found');
    } catch (e) {
      this.pageTitle.set('Not Found');
      console.error('Failed to load journey details', e);
    } finally {
      this.isLoading.set(false);
    }
  }

  goBack() {
    this.router.navigate(['/journey']);
  }
}
