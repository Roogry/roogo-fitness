import { DatePipe } from '@angular/common';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { provideZard } from '@/core/provider/providezard';
import { ExerciseService } from '@/core/services/exercise.service';
import { PointerModeService } from '@/core/services/pointer-mode.service';
import { VisualViewportService } from '@/core/services/visual-viewport.service';
import { ExerciseContextMenuService } from '@/features/exercise/services/exercise-context-menu.service';
import { WorkoutService } from '@/core/services/workout.service';
import { SwipeActionsGroup } from '@/shared/directives/swipe-actions';
import { ZardDialogService } from '@/shared/components/zard/dialog';
import { Exercise, LoggedExercise } from '@/shared/models';
import { SessionActive, lastExerciseIdWithCompletedSet } from './session-active';

function tracked(id: number, completedAt?: string): LoggedExercise {
  const exercise: Exercise = {
    id,
    name: `Exercise ${id}`,
    media: [],
  };

  return {
    id,
    exercise,
    sets: [
      {
        id: id * 10,
        set_number: 1,
        reps_completed: 8,
        weight_lifted: 40,
        completed_at: completedAt,
      },
    ],
  };
}

describe('lastExerciseIdWithCompletedSet', () => {
  it('returns null when nothing is completed', () => {
    expect(lastExerciseIdWithCompletedSet([])).toBeNull();
    expect(lastExerciseIdWithCompletedSet([tracked(1), tracked(2)])).toBeNull();
    expect(lastExerciseIdWithCompletedSet([tracked(1, '')])).toBeNull();
  });

  it('returns the last exercise in list order that has a completed set', () => {
    const exercises = [
      tracked(1, '2026-10-08T00:00:00.000Z'),
      tracked(2),
      tracked(3, '2026-10-08T00:01:00.000Z'),
      tracked(4),
    ];

    expect(lastExerciseIdWithCompletedSet(exercises)).toBe(3);
  });

  it('counts an exercise when any set is completed', () => {
    const exercise = tracked(7);
    exercise.sets.push({
      id: 71,
      set_number: 2,
      completed_at: '2026-10-08T00:02:00.000Z',
    });

    expect(lastExerciseIdWithCompletedSet([tracked(1), exercise, tracked(8)])).toBe(7);
  });
});

describe('SessionActive resume scroll', () => {
  const trackedExercises = signal<LoggedExercise[]>([]);
  const sessionStartTime = signal<number | null>(1_000);
  const scrollIntoView = vi.fn();
  const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;

  beforeEach(async () => {
    trackedExercises.set([]);
    sessionStartTime.set(1_000);
    scrollIntoView.mockClear();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    const workout = {
      trackedExercises,
      sessionStartTime,
      sessionDuration: signal(90),
      totalVolume: signal(0),
      totalSets: signal(0),
      isRestActive: signal(false),
      selectedPlanId: signal<number | null>(null),
      selectedSessionId: signal<number | null>(null),
      sessionTitle: signal('Workout Session'),
      refreshTrackedExercises: vi.fn().mockResolvedValue(undefined),
      clearSession: vi.fn(),
      startSessionTimer: vi.fn(),
      setupSessionFromPlan: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [SessionActive],
      providers: [
        provideRouter([]),
        provideZard(),
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(convertToParamMap({})) },
        },
        { provide: WorkoutService, useValue: workout },
        { provide: ZardDialogService, useValue: { create: vi.fn() } },
        {
          provide: ExerciseService,
          useValue: { getExercises: vi.fn().mockResolvedValue([]) },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
    TestBed.resetTestingModule();
  });

  async function render(): Promise<ComponentFixture<SessionActive>> {
    const fixture = TestBed.createComponent(SessionActive);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('scrolls once to the last exercise with a completed set', async () => {
    trackedExercises.set([
      tracked(1, '2026-10-08T00:00:00.000Z'),
      tracked(2, '2026-10-08T00:01:00.000Z'),
      tracked(3),
    ]);

    const fixture = await render();
    const target = fixture.nativeElement.querySelector('[data-exercise-id="2"]');

    expect(target).toBeInstanceOf(HTMLElement);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.instances[0]).toBe(target);
    expect(scrollIntoView).toHaveBeenCalledWith({
      block: 'center',
      inline: 'nearest',
      behavior: 'instant',
    });

    trackedExercises.update((exercises) => {
      const next = exercises.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.map((set) => ({ ...set })),
      }));
      next[2].sets[0].completed_at = '2026-10-08T00:03:00.000Z';
      return next;
    });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it('does not scroll when no set is completed', async () => {
    trackedExercises.set([tracked(1), tracked(2)]);

    const fixture = await render();

    expect(scrollIntoView).not.toHaveBeenCalled();

    trackedExercises.update((exercises) => {
      const next = exercises.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.map((set) => ({ ...set })),
      }));
      next[1].sets[0].completed_at = '2026-10-08T00:04:00.000Z';
      return next;
    });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('does not scroll when the session is not running', async () => {
    sessionStartTime.set(null);
    trackedExercises.set([tracked(1, '2026-10-08T00:00:00.000Z')]);

    await render();

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});

describe('SessionActive duration control', () => {
  const sessionStart = new Date(2026, 9, 8, 18, 41, 0).getTime();
  const sessionStartTime = signal<number | null>(sessionStart);
  const sessionDuration = signal(125);
  const trackedExercises = signal<LoggedExercise[]>([]);

  beforeEach(async () => {
    sessionStartTime.set(sessionStart);
    sessionDuration.set(125);
    trackedExercises.set([]);

    const workout = {
      trackedExercises,
      sessionStartTime,
      sessionDuration,
      totalVolume: signal(0),
      totalSets: signal(0),
      isRestActive: signal(false),
      selectedPlanId: signal<number | null>(null),
      selectedSessionId: signal<number | null>(null),
      sessionTitle: signal('Workout Session'),
      refreshTrackedExercises: vi.fn().mockResolvedValue(undefined),
      clearSession: vi.fn(),
      startSessionTimer: vi.fn(),
      setupSessionFromPlan: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [SessionActive],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(convertToParamMap({})) },
        },
        { provide: WorkoutService, useValue: workout },
        { provide: ZardDialogService, useValue: { create: vi.fn() } },
        {
          provide: ExerciseService,
          useValue: { getExercises: vi.fn().mockResolvedValue([]) },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
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

    const startedAt = new DatePipe('en-US').transform(sessionStart, 'HH:mm');
    expect(startedAt).toBe('18:41');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.textContent).toContain('Started');
    expect(button.textContent).toContain(startedAt);
    expect(button.textContent).not.toContain('PM');
    expect(button.textContent).not.toContain('AM');
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

  it('slides the session bar down while the keyboard is open', () => {
    const fixture = TestBed.createComponent(SessionActive);
    fixture.detectChanges();
    const bar = fixture.nativeElement.querySelector('[data-testid="session-bar"]') as HTMLElement;

    expect(bar.className).toContain('transition-[opacity,transform]');
    expect(bar.className).toContain('duration-200');
    expect(bar.className).toContain('motion-reduce:transition-none');
    expect(bar.classList.contains('opacity-0')).toBe(false);
    expect(bar.classList.contains('translate-y-2')).toBe(false);

    TestBed.inject(VisualViewportService).keyboardOffset.set(320);
    fixture.detectChanges();

    expect(bar.classList.contains('opacity-0')).toBe(true);
    expect(bar.classList.contains('translate-y-2')).toBe(true);
    expect(bar.classList.contains('pointer-events-none')).toBe(true);
    expect(bar.getAttribute('aria-hidden')).toBe('true');

    TestBed.inject(VisualViewportService).keyboardOffset.set(0);
    fixture.detectChanges();

    expect(bar.classList.contains('opacity-0')).toBe(false);
    expect(bar.classList.contains('translate-y-2')).toBe(false);
    expect(bar.hasAttribute('aria-hidden')).toBe(false);
  });
});

describe('SessionActive replace exercise', () => {
  const trackedExercises = signal<LoggedExercise[]>([]);
  const dialog = { create: vi.fn() };
  const getExercises = vi.fn();
  const replaceTrackedExercise = vi.fn().mockReturnValue(true);
  const removeTrackedExercise = vi.fn();
  const savedTargetsForExercise = vi.fn().mockResolvedValue(null);

  const chest = { id: 10, name: 'Chest' };
  const bench: Exercise = { id: 1, name: 'Bench Press', media: [], primary_muscle: chest };
  const incline: Exercise = { id: 2, name: 'Incline Press', media: [], primary_muscle: chest };
  const fly: Exercise = {
    id: 4,
    name: 'Fly',
    media: [],
    primary_muscle: { id: 30, name: 'Shoulders' },
    secondary_muscles: [chest],
  };
  const squat: Exercise = {
    id: 3,
    name: 'Squat',
    media: [],
    primary_muscle: { id: 20, name: 'Quads' },
  };

  beforeEach(async () => {
    trackedExercises.set([]);
    dialog.create.mockReset();
    getExercises.mockReset();
    replaceTrackedExercise.mockReset();
    replaceTrackedExercise.mockReturnValue(true);
    removeTrackedExercise.mockReset();
    savedTargetsForExercise.mockReset();
    savedTargetsForExercise.mockResolvedValue(null);
    getExercises.mockResolvedValue([bench, squat, fly, incline]);

    await TestBed.configureTestingModule({
      imports: [SessionActive],
      providers: [
        provideRouter([]),
        provideZard(),
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(convertToParamMap({})) },
        },
        {
          provide: WorkoutService,
          useValue: {
            trackedExercises,
            sessionStartTime: signal(1_000),
            sessionDuration: signal(30),
            totalVolume: signal(0),
            totalSets: signal(0),
            isRestActive: signal(false),
            selectedPlanId: signal<number | null>(null),
            selectedSessionId: signal<number | null>(null),
            sessionTitle: signal('Workout Session'),
            refreshTrackedExercises: vi.fn().mockResolvedValue(undefined),
            clearSession: vi.fn(),
            startSessionTimer: vi.fn(),
            setupSessionFromPlan: vi.fn().mockResolvedValue(undefined),
            replaceTrackedExercise,
            removeTrackedExercise,
            savedTargetsForExercise,
          },
        },
        { provide: ZardDialogService, useValue: dialog },
        { provide: ExerciseService, useValue: { getExercises } },
        { provide: PointerModeService, useValue: { isDesktop: signal(false) } },
      ],
    }).compileComponents();
  });

  afterEach(async () => {
    TestBed.inject(ExerciseContextMenuService).close();
    await new Promise((resolve) => setTimeout(resolve, 200));
    document.querySelector('.cdk-overlay-container')?.remove();
    document.documentElement.classList.remove('cdk-global-scrollblock');
    document.documentElement.style.top = '';
    document.documentElement.style.left = '';
    TestBed.resetTestingModule();
  });

  function logged(exercise: Exercise, completedAt?: string): LoggedExercise {
    return {
      id: exercise.id,
      exercise,
      sets: [
        {
          id: exercise.id * 10,
          set_number: 1,
          weight_lifted: 40,
          reps_completed: 8,
          completed_at: completedAt,
        },
      ],
    };
  }

  async function render(): Promise<ComponentFixture<SessionActive>> {
    const fixture = TestBed.createComponent(SessionActive);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('asks before replacing when sets are already logged', async () => {
    trackedExercises.set([logged(bench, '2026-10-11T00:00:00.000Z')]);
    const fixture = await render();

    fixture.componentInstance.onExerciseReplace({ exerciseId: bench.id });

    expect(dialog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        zTitle: 'Replace exercise?',
        zOkText: 'Continue',
        zCancelText: 'Cancel',
        zDescription: "You've logged 1 set. Their weight and reps will move to the new exercise.",
      }),
    );
    expect(fixture.componentInstance.isReplaceSheetOpen()).toBe(false);
    expect(getExercises).not.toHaveBeenCalled();
  });

  it('opens the picker directly, same muscle first, when nothing is logged', async () => {
    trackedExercises.set([logged(bench)]);
    const fixture = await render();

    await fixture.componentInstance.onExerciseReplace({ exerciseId: bench.id });
    fixture.detectChanges();

    expect(dialog.create).not.toHaveBeenCalled();
    expect(fixture.componentInstance.isReplaceSheetOpen()).toBe(true);
    expect(fixture.componentInstance.replaceCandidates().map((item) => item.id)).toEqual([
      incline.id,
      fly.id,
      squat.id,
    ]);
  });

  it('opens the picker after Continue and swaps in the picked exercise', async () => {
    trackedExercises.set([logged(bench, '2026-10-11T00:00:00.000Z'), logged(squat)]);
    savedTargetsForExercise.mockResolvedValue({
      target_sets: 3,
      target_weight: 50,
      target_reps: 6,
    });
    const fixture = await render();

    fixture.componentInstance.onExerciseReplace({ exerciseId: bench.id });
    const onContinue = dialog.create.mock.calls[0][0].zOnOk as () => Promise<void>;
    await onContinue();
    fixture.detectChanges();

    expect(fixture.componentInstance.isReplaceSheetOpen()).toBe(true);
    expect(fixture.componentInstance.replaceCandidates().map((item) => item.id)).toEqual([
      incline.id,
      fly.id,
    ]);

    await fixture.componentInstance.onReplacementPicked(incline);

    expect(savedTargetsForExercise).toHaveBeenCalledWith(incline.id);
    expect(replaceTrackedExercise).toHaveBeenCalledWith(bench.id, incline, {
      target_sets: 3,
      target_weight: 50,
      target_reps: 6,
    });
    expect(fixture.componentInstance.isReplaceSheetOpen()).toBe(false);
  });

  it('asks before deleting logged sets and closes the swipe on cancel', async () => {
    trackedExercises.set([logged(bench, '2026-10-11T00:00:00.000Z')]);
    const fixture = await render();
    const closeAll = vi.spyOn(fixture.debugElement.injector.get(SwipeActionsGroup), 'closeAll');

    fixture.componentInstance.onExerciseRemove({ exerciseId: bench.id });

    expect(dialog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        zTitle: 'Delete exercise?',
        zDescription: "You've logged 1 set. They'll be removed from this session.",
        zOkText: 'Delete',
        zCancelText: 'Cancel',
        zOkDestructive: true,
      }),
    );
    expect(removeTrackedExercise).not.toHaveBeenCalled();
    expect(closeAll).toHaveBeenCalledOnce();

    const onCancel = dialog.create.mock.calls[0][0].zOnCancel as () => void;
    onCancel();

    expect(closeAll).toHaveBeenCalledTimes(2);
    expect(removeTrackedExercise).not.toHaveBeenCalled();
  });

  it('deletes the exercise when the confirm is accepted', async () => {
    trackedExercises.set([logged(bench, '2026-10-11T00:00:00.000Z'), logged(squat, '2026-10-11')]);
    const fixture = await render();

    fixture.componentInstance.onExerciseRemove({ exerciseId: bench.id });
    const onDelete = dialog.create.mock.calls[0][0].zOnOk as () => void;
    onDelete();

    expect(removeTrackedExercise).toHaveBeenCalledOnce();
    expect(removeTrackedExercise).toHaveBeenCalledWith(bench.id);
  });

  it('asks before deleting when the touch menu deletes a logged exercise', async () => {
    trackedExercises.set([logged(bench, '2026-10-11T00:00:00.000Z')]);
    const fixture = await render();

    openTouchMenu(fixture);
    (
      document.querySelector('[data-testid="exercise-context-delete"]') as HTMLButtonElement
    ).click();

    expect(dialog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        zTitle: 'Delete exercise?',
        zDescription: "You've logged 1 set. They'll be removed from this session.",
        zOkText: 'Delete',
        zOkDestructive: true,
      }),
    );
    expect(removeTrackedExercise).not.toHaveBeenCalled();
  });

  it('asks before replacing when the touch menu replaces a logged exercise', async () => {
    trackedExercises.set([logged(bench, '2026-10-11T00:00:00.000Z')]);
    const fixture = await render();

    openTouchMenu(fixture);
    (
      document.querySelector('[data-testid="exercise-context-replace"]') as HTMLButtonElement
    ).click();

    expect(dialog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        zTitle: 'Replace exercise?',
        zOkText: 'Continue',
        zCancelText: 'Cancel',
      }),
    );
    expect(fixture.componentInstance.isReplaceSheetOpen()).toBe(false);
  });

  it('deletes immediately when nothing is logged', async () => {
    trackedExercises.set([logged(bench)]);
    const fixture = await render();
    const closeAll = vi.spyOn(fixture.debugElement.injector.get(SwipeActionsGroup), 'closeAll');

    fixture.componentInstance.onExerciseRemove({ exerciseId: bench.id });

    expect(dialog.create).not.toHaveBeenCalled();
    expect(removeTrackedExercise).toHaveBeenCalledWith(bench.id);
    expect(closeAll).toHaveBeenCalledOnce();
  });
});

function openTouchMenu(fixture: ComponentFixture<SessionActive>) {
  const actions = fixture.nativeElement.querySelector(
    '[data-testid="exercise-actions"]',
  ) as HTMLButtonElement;
  expect(actions.className).toContain('sr-only');
  actions.click();
  fixture.detectChanges();
}
