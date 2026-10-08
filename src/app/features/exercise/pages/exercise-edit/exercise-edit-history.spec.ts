import { Location } from '@angular/common';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ExerciseService } from '@/core/services/exercise.service';
import { MuscleService } from '@/core/services/muscle.service';
import { WorkoutService } from '@/core/services/workout.service';
import { Exercise, Muscle } from '@/shared/models';
import { ExerciseDetail } from '../exercise-detail/exercise-detail';
import { ExerciseEdit } from './exercise-edit';

@Component({
  standalone: true,
  template: 'previous page',
})
class PreviousPage {}

const chest: Muscle = { id: 1, name: 'Chest' };

const exercise: Exercise = {
  id: 7,
  name: 'Bench Press',
  short_description: 'Press the bar',
  primary_muscle: chest,
  secondary_muscles: [],
  media: [],
  instructions: ['Lower the bar', 'Press up'],
  tips: 'Brace',
};

describe('exercise edit history', () => {
  let harness: RouterTestingHarness;
  let location: Location;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'exercise', component: PreviousPage },
          { path: 'exercise/:id', component: ExerciseDetail },
          { path: 'exercise/:id/edit', component: ExerciseEdit },
        ]),
        {
          provide: ExerciseService,
          useValue: {
            getExerciseById: vi.fn().mockResolvedValue(exercise),
            getExercisesByMuscle: vi.fn().mockResolvedValue([]),
            getExerciseJourneyStats: vi.fn().mockResolvedValue({
              highestWeight: 0,
              highestWeightReps: 0,
              totalSets: 0,
              recentSessions: [],
            }),
            updateExercise: vi.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: MuscleService,
          useValue: {
            getMuscles: vi.fn().mockResolvedValue([chest]),
          },
        },
        {
          provide: WorkoutService,
          useValue: {
            trackedExercises: signal([]),
            refreshTrackedExercises: vi.fn().mockResolvedValue(undefined),
            getExerciseById: vi.fn().mockResolvedValue(exercise),
          },
        },
      ],
    });

    location = TestBed.inject(Location);
    harness = await RouterTestingHarness.create('/exercise');
  });

  async function openDetailFromPreviousPage(): Promise<void> {
    await harness.navigateByUrl('/exercise/7');
    await waitFor(
      () => !!harness.routeNativeElement?.querySelector('a[href="/exercise/7/edit"]'),
      () => harness.detectChanges(),
    );
  }

  async function openEditFromDetail(): Promise<ExerciseEdit> {
    await openDetailFromPreviousPage();
    const editLink = harness.routeNativeElement!.querySelector(
      'a[href="/exercise/7/edit"]',
    ) as HTMLAnchorElement;
    editLink.click();
    await harness.fixture.whenStable();
    expect(location.path()).toBe('/exercise/7/edit');

    const edit = harness.routeDebugElement!.componentInstance as ExerciseEdit;
    await waitFor(
      () => !edit.isLoading() && edit.selectedExercise()?.id === 7,
      () => harness.detectChanges(),
    );
    harness.detectChanges();
    return edit;
  }

  it('shows updated detail after save, and one Back returns to the previous page', async () => {
    const edit = await openEditFromDetail();
    edit.save();
    await waitFor(() => location.path() === '/exercise/7');

    location.back();
    await harness.fixture.whenStable();
    expect(location.path()).toBe('/exercise');
  });

  it('browser Back from edit returns to the page before detail', async () => {
    await openEditFromDetail();
    location.back();
    await harness.fixture.whenStable();
    expect(location.path()).toBe('/exercise');
  });

  it('returns to detail on cancel without putting the form back on the stack', async () => {
    const edit = await openEditFromDetail();
    edit.cancel();
    await waitFor(() => location.path() === '/exercise/7');

    location.back();
    await harness.fixture.whenStable();
    expect(location.path()).toBe('/exercise');
  });

  it('header back from edit replaces the form with detail', async () => {
    await openEditFromDetail();
    const backButton = Array.from(harness.routeNativeElement!.querySelectorAll('button')).find(
      (button) => button.textContent?.includes('Back'),
    );
    expect(backButton).toBeTruthy();
    backButton!.click();
    await waitFor(() => location.path() === '/exercise/7');

    location.back();
    await harness.fixture.whenStable();
    expect(location.path()).toBe('/exercise');
  });

  it('still opens detail after save when edit was opened directly', async () => {
    await harness.navigateByUrl('/exercise/7/edit');
    const edit = harness.routeDebugElement!.componentInstance as ExerciseEdit;
    await waitFor(
      () => !edit.isLoading() && !!edit.selectedExercise(),
      () => harness.detectChanges(),
    );

    edit.save();
    await waitFor(() => location.path() === '/exercise/7');

    location.back();
    await harness.fixture.whenStable();
    expect(location.path()).toBe('/exercise');
  });
});

async function waitFor(predicate: () => boolean, tick?: () => void): Promise<void> {
  for (let attempt = 0; attempt < 30; attempt++) {
    tick?.();
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error('condition was not met');
}
