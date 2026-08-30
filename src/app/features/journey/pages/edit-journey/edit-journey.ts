import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucidePlus, lucideDumbbell } from '@ng-icons/lucide';
import { JourneyService } from '../../services/journey.service';
import { Exercise, LoggedSession, LoggedExercise, LoggedSet } from '@/shared/models';
import { DurationFormatPipe } from '@/shared/pipes/duration-format-pipe';
import { HeaderComponent } from '@/shared/components/header/header.component';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { ZardInputDirective } from '@/shared/components/zard/input';
import { RooSheetComponent } from '@/shared/components/sheet/sheet';
import { ExerciseTracker } from '@/features/exercise/components/exercise-tracker/exercise-tracker';
import { ExerciseAutocomplete } from '@/features/exercise/components/exercise-autocomplete/exercise-autocomplete';

/**
 * A page for editing an already logged workout session.
 *
 * The user can rename the session, edit weights/reps per set, add or remove
 * sets and exercises. All edits are applied to a local working copy and only
 * persisted when the user clicks Save in the header.
 *
 * @example
 * <app-edit-journey></app-edit-journey> // routed at /journey/:id/edit
 */
@Component({
  selector: 'app-edit-journey',
  standalone: true,
  imports: [
    CommonModule,
    DurationFormatPipe,
    HeaderComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ExerciseTracker,
    RooSheetComponent,
    ExerciseAutocomplete,
    NgIcon,
  ],
  providers: [provideIcons({ lucideCheck, lucidePlus, lucideDumbbell })],
  templateUrl: './edit-journey.html',
})
export class EditJourney implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private journeyService = inject(JourneyService);

  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  isAddSheetOpen = signal<boolean>(false);

  // Working copy state — the original session in the DB stays untouched until Save
  sessionTitle = signal<string>('');
  sessionDuration = signal<number>(0);
  exercises = signal<LoggedExercise[]>([]);

  private sessionId!: number;
  private originalSession: LoggedSession | null = null;

  totalVolume = computed(() =>
    this.exercises().reduce(
      (acc, workout) =>
        acc +
        workout.sets.reduce(
          (setAcc, set) => setAcc + (set.weight_lifted ?? 0) * (set.reps_completed ?? 0),
          0,
        ),
      0,
    ),
  );

  canSave = computed(() => this.sessionTitle().trim().length > 0 && !this.isSaving());

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);
    if (!idParam || Number.isNaN(id)) {
      this.goBack();
      return;
    }
    this.sessionId = id;
    this.load();
  }

  async load() {
    try {
      this.isLoading.set(true);
      const session = await this.journeyService.getLoggedSession(this.sessionId);
      if (!session) {
        this.goBack();
        return;
      }

      this.originalSession = session;
      // Deep copy so editing never mutates the cached original before saving
      const copy: LoggedSession = structuredClone(session);

      this.sessionTitle.set(copy.session_title);
      this.sessionDuration.set(copy.total_duration ?? 0);
      this.exercises.set(copy.workouts ?? []);
    } catch (e) {
      console.error('Failed to load journey for editing', e);
      this.goBack();
    } finally {
      this.isLoading.set(false);
    }
  }

  onTitleInput(event: Event) {
    this.sessionTitle.set((event.target as HTMLInputElement).value);
  }

  onAddSet(e: { exerciseId: number; weight: number; reps: number }) {
    this.exercises.update((list) =>
      list.map((workout) =>
        workout.exercise.id !== e.exerciseId
          ? workout
          : {
              ...workout,
              sets: [
                ...workout.sets,
                {
                  id: Date.now() + Math.floor(Math.random() * 10000),
                  set_number: workout.sets.length + 1,
                  weight_lifted: e.weight,
                  reps_completed: e.reps,
                },
              ],
            },
      ),
    );
  }

  onSetUpdate(e: { exerciseId: number; setId: number; updates: Partial<LoggedSet> }) {
    this.exercises.update((list) =>
      list.map((workout) =>
        workout.exercise.id !== e.exerciseId
          ? workout
          : {
              ...workout,
              sets: workout.sets.map((s) => (s.id === e.setId ? { ...s, ...e.updates } : s)),
            },
      ),
    );
  }

  onSetRemove(e: { exerciseId: number; setId: number }) {
    this.exercises.update((list) =>
      list.map((workout) =>
        workout.exercise.id !== e.exerciseId
          ? workout
          : {
              ...workout,
              sets: workout.sets
                .filter((s) => s.id !== e.setId)
                .map((s, idx) => ({ ...s, set_number: idx + 1 })),
            },
      ),
    );
  }

  onExerciseRemove(e: { exerciseId: number }) {
    this.exercises.update((list) => list.filter((w) => w.exercise.id !== e.exerciseId));
  }

  onExerciseSelected(exercise: Exercise) {
    // Prevent duplicate exercise cards, same rule as the active session page
    if (this.exercises().some((w) => w.exercise.id === exercise.id)) {
      this.isAddSheetOpen.set(false);
      return;
    }

    this.exercises.update((list) => [...list, { id: Date.now(), exercise, sets: [] }]);
    this.isAddSheetOpen.set(false);
  }

  async save() {
    if (!this.canSave() || !this.originalSession) return;

    this.isSaving.set(true);
    try {
      await this.journeyService.updateLoggedSession({
        ...this.originalSession,
        session_title: this.sessionTitle().trim(),
        total_weight_lifted: this.totalVolume(),
        updatedAt: new Date().toISOString(),
        workouts: this.exercises(),
      });
      // Pop the edit page from history so the header back button
      // on JourneyDetail no longer returns to this edit page
      this.location.back();
    } catch (error) {
      console.error('Failed to save journey', error);
    } finally {
      this.isSaving.set(false);
    }
  }

  goBack() {
    if (this.sessionId) {
      this.router.navigate(['/journey', this.sessionId]);
    } else {
      this.router.navigate(['/journey']);
    }
  }
}
