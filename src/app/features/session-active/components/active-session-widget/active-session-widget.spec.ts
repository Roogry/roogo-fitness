import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { ZardDialogService } from '@/shared/components/zard/dialog';
import { DbService } from '@/core/services/db.service';
import { WorkoutService } from '@/core/services/workout.service';
import { ActiveSessionWidgetComponent } from './active-session-widget';

describe('ActiveSessionWidgetComponent rest row', () => {
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    navigate = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        { provide: DbService, useValue: {} },
        { provide: Router, useValue: { navigate } },
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
    expect(root.querySelector('app-rest-timer-bar')).toBeTruthy();
    expect(restIndex).toBeGreaterThan(-1);
    expect(titleIndex).toBeGreaterThan(restIndex);
    expect(text).toContain('02:05');
    expect(text).toContain('+15s');
    expect(text).toContain('Skip');

    const badge = root.querySelector('.timer-badge');
    expect(badge?.textContent).not.toContain('02:05');
    expect(badge?.textContent).not.toContain('Rest');
  });

  it('adds 15 seconds from the rest row without navigating', () => {
    const { fixture, service } = setup();
    service.startRestTimer(60);
    fixture.detectChanges();

    const addButton = buttonWith(fixture.nativeElement, '+15s');
    addButton.click();
    fixture.detectChanges();

    expect(service.restRemainingSeconds()).toBe(75);
    expect(fixture.nativeElement.textContent).toContain('01:15');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('skips rest from the rest row without navigating', () => {
    const { fixture, service } = setup();
    service.startRestTimer(60);
    fixture.detectChanges();

    buttonWith(fixture.nativeElement, 'Skip').click();
    fixture.detectChanges();

    expect(service.isRestActive()).toBe(false);
    expect(fixture.nativeElement.textContent).not.toContain('+15s');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('navigates when the session row is clicked', () => {
    const { fixture, service } = setup();
    service.startRestTimer(60);
    fixture.detectChanges();

    const badge: HTMLElement = fixture.nativeElement.querySelector('.timer-badge');
    badge.click();

    expect(navigate).toHaveBeenCalledWith(['/session/active']);
  });

  it('keeps the single-row pill when rest is inactive', () => {
    const { fixture } = setup();

    const root: HTMLElement = fixture.nativeElement.querySelector('.active-session-widget');
    const text = root.textContent ?? '';

    expect(root.className).toContain('rounded-full');
    expect(root.className).not.toContain('rounded-4xl');
    expect(text).not.toContain('Rest');
    expect(text).toContain('Pull #1');
    expect(text).not.toContain('+15s');
  });
});

function buttonWith(root: HTMLElement, label: string): HTMLButtonElement {
  const button = Array.from(root.querySelectorAll('button')).find((candidate) =>
    candidate.textContent?.includes(label),
  );
  if (!button) {
    throw new Error(`Missing button ${label}`);
  }
  return button;
}
