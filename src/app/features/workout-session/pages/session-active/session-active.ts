import { Component, inject, OnInit, signal, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDumbbell, lucidePlus, lucideCheck } from '@ng-icons/lucide';
import { WorkoutService } from '@/core/services/workout.service';
import { ExerciseAutocomplete } from '@/features/exercise/components/exercise-autocomplete/exercise-autocomplete';
import { ExerciseTracker } from '@/features/exercise/components/exercise-tracker/exercise-tracker';
import { HeaderComponent } from '@/shared/components/header/header';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { RooSheetComponent } from '@/shared/components/sheet/sheet';
import { DurationFormatPipe } from '@/shared/pipes/duration-format-pipe';
import { ZardInputDirective } from '@/shared/components/zard/input';
import { ZardDialogService, ZardDialogRef } from '@/shared/components/zard/dialog';

@Component({
  selector: 'app-session-active',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ExerciseAutocomplete,
    ExerciseTracker,
    HeaderComponent,
    ZardButtonComponent,
    ZardInputDirective,
    RooSheetComponent,
    DurationFormatPipe,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideDumbbell,
      lucidePlus,
      lucideCheck,
    }),
  ],
  templateUrl: './session-active.html',
  styleUrl: './session-active.css',
})
export class SessionActive implements OnInit {
  workoutService = inject(WorkoutService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  dialogService = inject(ZardDialogService);

  @ViewChild('discardDialog') discardDialogTemplate!: TemplateRef<any>;
  private dialogRef?: ZardDialogRef<any>;

  // State
  isAddSheetOpen = signal(false);

  ngOnInit() {
    this.setupSessionData();
  }

  setupSessionData() {
    this.route.queryParamMap.subscribe(async (queryParams) => {
      const planId = queryParams.get('planId');
      const sessionId = queryParams.get('sessionId');

      if (planId && sessionId) {
        // Jika sesi dengan planId ini sudah berjalan, jangan timpa datanya agar input pengguna tidak hilang
        if (
          this.workoutService.sessionStartTime() &&
          this.workoutService.selectedPlanId() === Number(planId)
        ) {
          return;
        }
        await this.workoutService.setSessionFromBlueprint(Number(planId), Number(sessionId));
      } else {
        // Jika sesi aktif sedang berjalan (baik empty session maupun dari plan), jangan hapus/reset
        if (this.workoutService.sessionStartTime()) {
          return;
        }
        this.workoutService.clearSession();
        this.workoutService.sessionTitle.set('Workout Session');
      }
    });
  }

  onExerciseSelected(exercise: any) {
    this.workoutService.addTrackedExercise(exercise);
    this.isAddSheetOpen.set(false);

    if (!this.workoutService.sessionStartTime()) {
      this.workoutService.startSessionTimer();
    }
  }

  async finishSession() {
    await this.workoutService.finishSession();
    this.router.navigate(['/journey']);
  }

  openDiscardConfirm() {
    this.dialogRef = this.dialogService.create({
      zContent: this.discardDialogTemplate,
      zTitle: 'Discard Session?',
      zHideFooter: true,
    });
  }

  confirmDiscard() {
    this.workoutService.stopSession();
    this.setupSessionData();
    this.closeDiscard();
  }

  closeDiscard() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
