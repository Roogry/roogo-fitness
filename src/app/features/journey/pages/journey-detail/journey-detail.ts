import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutService } from '@/core/services/workout.service';
import { LoggedSession } from '@/shared/models';
import { DurationFormatPipe } from '@/shared/pipes/duration-format-pipe';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { HeaderComponent } from '@/shared/components/header/header.component';
import { ExerciseTracker } from '@/features/exercise/components/exercise-tracker/exercise-tracker';
import { ZardPopoverComponent, ZardPopoverDirective } from '@/shared/components/zard/popover';
import { ZardDialogService } from '@/shared/components/zard/dialog';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsis, lucidePencil, lucideTrash2 } from '@ng-icons/lucide';

@Component({
  selector: 'app-journey-detail',
  standalone: true,
  imports: [
    CommonModule,
    DurationFormatPipe,
    ZardButtonComponent,
    HeaderComponent,
    ExerciseTracker,
    ZardPopoverComponent,
    ZardPopoverDirective,
    NgIcon,
  ],
  providers: [provideIcons({ lucideEllipsis, lucidePencil, lucideTrash2 })],
  templateUrl: './journey-detail.html',
})
export class JourneyDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workoutService = inject(WorkoutService);
  private dialogService = inject(ZardDialogService);

  loggedSession = signal<LoggedSession | undefined>(undefined);
  pageTitle = signal<string>('Loading...');
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
      this.pageTitle.set(LoggedSession?.session_title ?? 'Not Found');
    } catch (e) {
      this.pageTitle.set('Not Found');
      console.error('Failed to load journey details', e);
    } finally {
      this.isLoading.set(false);
    }
  }

  deleteJourney() {
    const sessionId = this.loggedSession()?.id;
    if (!sessionId) return;

    this.dialogService.create({
      zTitle: 'Delete Journey',
      zWidth: '400px',
      zDescription: 'Are you sure you want to delete this journey? This action cannot be undone.',
      zOkText: 'Delete',
      zOkDestructive: true,
      zOnOk: async () => {
        try {
          await this.workoutService.deleteLoggedSession(sessionId);
          this.goBack();
        } catch (error) {
          console.error('Failed to delete journey', error);
        }
      },
    });
  }

  goBack() {
    this.router.navigate(['/journey'], { queryParams: { tab: 'history' } });
  }
}
