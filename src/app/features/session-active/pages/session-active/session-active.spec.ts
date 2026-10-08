import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { WorkoutService } from '@/core/services/workout.service';
import { ExerciseAutocomplete } from '@/features/exercise/components/exercise-autocomplete/exercise-autocomplete';
import { ZardDialogService } from '@/shared/components/zard/dialog';
import { SessionActive } from './session-active';

@Component({
  selector: 'app-exercise-autocomplete',
  standalone: true,
  template: '',
})
class ExerciseAutocompleteStub {}

describe('SessionActive duration control', () => {
  const sessionStart = new Date(2026, 9, 8, 18, 41, 0).getTime();
  const sessionStartTime = signal<number | null>(sessionStart);
  const sessionDuration = signal(125);
  const trackedExercises = signal<unknown[]>([]);

  const mockWorkoutService = {
    sessionStartTime,
    sessionDuration,
    trackedExercises,
    sessionTitle: signal('Workout Session'),
    selectedPlanId: signal<number | null>(null),
    totalVolume: signal(0),
    totalSets: signal(0),
    startSessionTimer: vi.fn(),
    clearSession: vi.fn(),
    refreshTrackedExercises: vi.fn(),
    setupSessionFromPlan: vi.fn(),
  };

  beforeEach(async () => {
    sessionStartTime.set(sessionStart);
    sessionDuration.set(125);
    trackedExercises.set([]);

    await TestBed.configureTestingModule({
      imports: [SessionActive],
      providers: [
        { provide: WorkoutService, useValue: mockWorkoutService },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ZardDialogService, useValue: { create: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(convertToParamMap({})) },
        },
      ],
    })
      .overrideComponent(SessionActive, {
        remove: { imports: [ExerciseAutocomplete] },
        add: { imports: [ExerciseAutocompleteStub] },
      })
      .compileComponents();
  });

  function durationButton(root: HTMLElement): HTMLButtonElement {
    const button = root.querySelector<HTMLButtonElement>('button[aria-pressed]');
    if (!button) {
      throw new Error('Duration control was not rendered');
    }
    return button;
  }

  it('toggles the bottom bar between elapsed duration and start time', () => {
    const fixture = TestBed.createComponent(SessionActive);
    fixture.detectChanges();

    const button = durationButton(fixture.nativeElement);
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.textContent).toContain('Duration');
    expect(button.textContent).toContain('2:5s');

    button.click();
    fixture.detectChanges();

    const startedAt = new DatePipe('en-US').transform(sessionStart, 'shortTime');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.textContent).toContain('Started');
    expect(button.textContent).toContain(startedAt);
    expect(fixture.componentInstance.showStartTime()).toBe(true);

    button.click();
    fixture.detectChanges();

    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.textContent).toContain('Duration');
    expect(button.textContent).not.toContain('Started');
    expect(fixture.componentInstance.showStartTime()).toBe(false);
  });

  it('hides the duration control when no session is running', () => {
    sessionStartTime.set(null);
    const fixture = TestBed.createComponent(SessionActive);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button[aria-pressed]')).toBeNull();
  });
});
