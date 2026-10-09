import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { ZardDialogService } from '@/shared/components/zard/dialog';
import { DbService } from './db.service';
import { WorkoutService } from './workout.service';

const STORAGE_KEY = 'roogo_active_session';

describe('WorkoutService rest timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        WorkoutService,
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

  function createService(): WorkoutService {
    const service = TestBed.inject(WorkoutService);
    TestBed.flushEffects();
    return service;
  }

  it('starts rest from an end timestamp and formats MM:SS', () => {
    const service = createService();
    const startedAt = Date.now();

    service.startRestTimer(90);

    expect(service.isRestActive()).toBe(true);
    expect(service.restRemainingSeconds()).toBe(90);
    expect(service.restEndsAt()).toBe(startedAt + 90_000);
    expect(service.restTimerFormatted()).toBe('01:30');
  });

  it('does not start rest for a non-positive duration', () => {
    const service = createService();

    service.startRestTimer(0);
    service.startRestTimer(-5);

    expect(service.isRestActive()).toBe(false);
    expect(service.restEndsAt()).toBeNull();
  });

  it('restarts rest when another set is completed', () => {
    const service = createService();

    service.startRestTimer(60);
    vi.advanceTimersByTime(10_000);
    service.startRestTimer(45);

    expect(service.restRemainingSeconds()).toBe(45);
    expect(service.restEndsAt()).toBe(Date.now() + 45_000);
  });

  it('counts down from restEndsAt and clears rest at zero', () => {
    const service = createService();

    service.startRestTimer(3);
    vi.advanceTimersByTime(2_000);
    expect(service.restRemainingSeconds()).toBe(1);
    expect(service.isRestActive()).toBe(true);

    vi.advanceTimersByTime(1_000);
    expect(service.restRemainingSeconds()).toBeNull();
    expect(service.restEndsAt()).toBeNull();
    expect(service.isRestActive()).toBe(false);
  });

  it('adds time only while rest is active', () => {
    const service = createService();

    service.addRestTime(15);
    expect(service.restEndsAt()).toBeNull();

    service.startRestTimer(30);
    vi.advanceTimersByTime(5_000);
    service.addRestTime(15);

    expect(service.restRemainingSeconds()).toBe(40);
    expect(service.restEndsAt()).toBe(Date.now() + 40_000);
  });

  it('skips rest immediately', () => {
    const service = createService();

    service.startRestTimer(30);
    service.skipRestTimer();

    expect(service.isRestActive()).toBe(false);
    expect(service.restEndsAt()).toBeNull();
    expect(service.restRemainingSeconds()).toBeNull();
  });

  it('clears rest when the session is cleared', () => {
    const service = createService();

    service.startSessionTimer();
    service.startRestTimer(30);
    service.clearSession();

    expect(service.sessionStartTime()).toBeNull();
    expect(service.isRestActive()).toBe(false);
    expect(service.restEndsAt()).toBeNull();
  });

  it('persists restEndsAt and restores a future countdown', () => {
    const first = createService();
    first.startSessionTimer();
    first.sessionTitle.set('Push');
    first.startRestTimer(50);
    const restEndsAt = first.restEndsAt();

    TestBed.flushEffects();
    vi.advanceTimersByTime(500);

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(saved.restEndsAt).toBe(restEndsAt);

    first.clearRestTimer();
    first.stopSessionTimer();
    TestBed.resetTestingModule();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    TestBed.configureTestingModule({
      providers: [
        WorkoutService,
        { provide: DbService, useValue: {} },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ZardDialogService, useValue: { create: vi.fn() } },
      ],
    });

    const restored = createService();
    expect(restored.sessionTitle()).toBe('Push');
    expect(restored.restEndsAt()).toBe(restEndsAt);
    expect(restored.isRestActive()).toBe(true);
    expect(restored.restRemainingSeconds()).toBeGreaterThan(0);
  });

  it('drops expired rest when restoring a session', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selectedPlanId: 1,
        selectedSessionId: 2,
        sessionTitle: 'Pull',
        trackedExercises: [],
        sessionStartTime: Date.now() - 5_000,
        sessionDuration: 5,
        restEndsAt: Date.now() - 1_000,
      }),
    );

    const service = createService();

    expect(service.sessionTitle()).toBe('Pull');
    expect(service.sessionStartTime()).not.toBeNull();
    expect(service.restEndsAt()).toBeNull();
    expect(service.isRestActive()).toBe(false);
  });
});
