import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ZardDialogService } from '@/shared/components/zard/dialog';
import { DbService } from '@/core/services/db.service';
import { WorkoutService } from '@/core/services/workout.service';
import { SessionActive } from './session-active';

describe('SessionActive rest controls', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        { provide: DbService, useValue: {} },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ZardDialogService, useValue: { create: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(convertToParamMap({})) },
        },
      ],
    });
  });

  afterEach(() => {
    const service = TestBed.inject(WorkoutService);
    service.clearRestTimer();
    service.stopSessionTimer();
    localStorage.clear();
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  it('keeps +15s and Skip in sync with the shared rest countdown', () => {
    const fixture = TestBed.createComponent(SessionActive);
    const service = TestBed.inject(WorkoutService);
    fixture.detectChanges();

    service.startSessionTimer();
    service.startRestTimer(90);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain('01:30');

    const addButton = Array.from(host.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('+15s'),
    );
    expect(addButton).toBeTruthy();
    addButton!.click();
    fixture.detectChanges();

    expect(service.restRemainingSeconds()).toBe(105);
    expect(host.textContent).toContain('01:45');

    const skipButton = Array.from(host.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Skip'),
    );
    skipButton!.click();
    fixture.detectChanges();

    expect(service.isRestActive()).toBe(false);
    expect(host.textContent).not.toContain('01:45');
    expect(host.textContent).not.toContain('+15s');
  });
});
