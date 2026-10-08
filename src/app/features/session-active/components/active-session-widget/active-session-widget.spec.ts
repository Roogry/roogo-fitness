import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { ZardDialogService } from '@/shared/components/zard/dialog';
import { DbService } from '@/core/services/db.service';
import { WorkoutService } from '@/core/services/workout.service';
import { ActiveSessionWidgetComponent } from './active-session-widget';

describe('ActiveSessionWidgetComponent rest row', () => {
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
    const service = TestBed.inject(WorkoutService);
    service.clearRestTimer();
    service.stopSessionTimer();
    localStorage.clear();
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  function setup() {
    const fixture = TestBed.createComponent(ActiveSessionWidgetComponent);
    const service = TestBed.inject(WorkoutService);
    service.startSessionTimer();
    service.sessionTitle.set('Pull #1');
    fixture.detectChanges();
    return { fixture, service };
  }

  it('stacks rest above the session row and leaves the duration badge alone', () => {
    const { fixture, service } = setup();

    service.startRestTimer(125);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement.querySelector('.active-session-widget');
    const text = root.textContent ?? '';
    const restIndex = text.indexOf('Rest');
    const titleIndex = text.indexOf('Pull #1');

    expect(root.className).toContain('rounded-4xl');
    expect(restIndex).toBeGreaterThan(-1);
    expect(titleIndex).toBeGreaterThan(restIndex);
    expect(text).toContain('02:05');
    expect(text).not.toContain('+15s');
    expect(text).not.toContain('Skip');

    const badge = root.querySelector('.timer-badge');
    expect(badge?.textContent).not.toContain('02:05');
  });

  it('keeps the single-row pill when rest is inactive', () => {
    const { fixture } = setup();

    const root: HTMLElement = fixture.nativeElement.querySelector('.active-session-widget');
    const text = root.textContent ?? '';

    expect(root.className).toContain('rounded-full');
    expect(root.className).not.toContain('rounded-4xl');
    expect(text).not.toContain('Rest');
    expect(text).toContain('Pull #1');
  });
});
