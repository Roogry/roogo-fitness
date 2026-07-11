import { Component, inject, effect, model, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WorkoutService } from '@/core/services/workout.service';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { RooSheetComponent } from '@/shared/components/sheet/sheet';
import { DurationFormatPipe } from '@/shared/pipes/duration-format-pipe';
import { ZardInputDirective } from '@/shared/components/zard/input';
import { ZardDialogService } from '@/shared/components/zard/dialog';
import { form, FormField, required } from '@angular/forms/signals';
import { ZardFormImports } from '@/shared/components/zard/form';
import { ZardCheckboxComponent } from '@/shared/components/zard/checkbox';

@Component({
  selector: 'app-active-session-finish-sheet',
  standalone: true,
  imports: [
    CommonModule,
    ZardButtonComponent,
    ZardInputDirective,
    RooSheetComponent,
    DurationFormatPipe,
    FormField,
    ZardFormImports,
    ZardCheckboxComponent,
    FormsModule,
  ],
  templateUrl: './active-session-finish-sheet.html',
})
export class ActiveSessionFinishSheet {
  workoutService = inject(WorkoutService);
  router = inject(Router);
  dialogService = inject(ZardDialogService);

  isOpen = model<boolean>(false);
  progressedExercises = input<any[]>([]);

  titleModel = signal({
    title: '',
    note: '',
  });

  titleForm = form(this.titleModel, (f) => {
    required(f.title, { message: 'Session title is required' });
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.titleModel.set({
          title: this.workoutService.sessionTitle(),
          note: '',
        });
        this.titleForm().reset();
      }
    });
  }

  async finishSession() {
    this.isOpen.set(false);

    const title = this.titleModel().title;
    const note = this.titleModel().note;

    const checkedProgressions = this.progressedExercises().filter((p) => p.shouldUpdateTarget);
    const planId = this.workoutService.selectedPlanId();
    const sessionId = this.workoutService.selectedSessionId();

    if (checkedProgressions.length > 0 && planId !== null && sessionId !== null) {
      const updates = checkedProgressions.map((p) => ({
        exerciseId: p.exerciseId,
        targetWeight: p.newWeight,
        targetReps: p.newReps,
      }));
      await this.workoutService.updatePlanTargets(planId, sessionId, updates);
    }

    await this.workoutService.finishSession(title, note);

    this.router.navigate(['/journey'], { queryParams: { tab: 'history' } });
  }

  openDiscardConfirm() {
    this.dialogService.create({
      zWidth: '400px',
      zTitle: 'Discard Session?',
      zDescription:
        'Are you sure you want to discard this session? All progress will be lost and cannot be recovered.',
      zOkText: 'Discard',
      zOkDestructive: true,
      zCancelText: 'Cancel',
      zOnOk: () => {
        this.isOpen.set(false);
        this.workoutService.clearSession();
        this.router.navigate(['/']);
      },
    });
  }
}
