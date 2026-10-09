import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { ZardDialogService } from '@/shared/components/zard/dialog';
import { DbService } from '@/core/services/db.service';
import { WorkoutService } from '@/core/services/workout.service';
import { RestTimerBar } from './rest-timer-bar';

describe('RestTimerBar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        { provide: DbService, useValue: {} },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ZardDialogService, useValue: { create: vi.fn() } },
      ],
    });
  });

  afterEach(() => {
    TestBed.inject(WorkoutService).clearRestTimer();
    localStorage.clear();
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  it('renders the session-page rest row and updates rest from its buttons', () => {
    const fixture = TestBed.createComponent(RestTimerBar);
    const service = TestBed.inject(WorkoutService);
    service.startRestTimer(90);
    fixture.detectChanges();

    const row: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(row.className).toContain('px-4');
    expect(row.className).toContain('sm:px-6');
    expect(row.className).toContain('py-4');
    expect(row.className).toContain('justify-between');
    expect(fixture.nativeElement.textContent).toContain('01:30');

    const addButton = Array.from(fixture.nativeElement.querySelectorAll('button')).find((button) =>
      (button as HTMLButtonElement).textContent?.includes('+15s'),
    ) as HTMLButtonElement;
    addButton.click();
    fixture.detectChanges();
    expect(service.restRemainingSeconds()).toBe(105);

    const skipButton = Array.from(fixture.nativeElement.querySelectorAll('button')).find((button) =>
      (button as HTMLButtonElement).textContent?.includes('Skip'),
    ) as HTMLButtonElement;
    skipButton.click();
    fixture.detectChanges();
    expect(service.isRestActive()).toBe(false);
  });
});
