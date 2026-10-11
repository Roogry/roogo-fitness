import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PointerModeService } from '@/core/services/pointer-mode.service';
import { provideZard } from '@/core/provider/providezard';
import { Exercise, LoggedExercise, LoggedSet } from '@/shared/models';
import { ExerciseTracker } from './exercise-tracker';

const exercise: Exercise = {
  id: 7,
  name: 'Bench Press',
  media: [],
};

function makeSet(id: number, setNumber: number): LoggedSet {
  return {
    id,
    set_number: setNumber,
    target_weight: 40,
    target_reps: 8,
  };
}

function trackedExercise(sets: LoggedSet[]): LoggedExercise {
  return {
    id: 1,
    exercise,
    sets,
  };
}

describe('ExerciseTracker weight Enter focus', () => {
  function setup(editable: boolean, sets = [makeSet(10, 1), makeSet(20, 2)]) {
    TestBed.configureTestingModule({
      imports: [ExerciseTracker],
      providers: [provideRouter([])],
    });

    const fixture = TestBed.createComponent(ExerciseTracker);
    fixture.componentRef.setInput('trackedExercise', trackedExercise(sets));
    fixture.componentRef.setInput('editable', editable);
    fixture.detectChanges();
    return fixture;
  }

  function inputs(root: HTMLElement): HTMLInputElement[] {
    return Array.from(root.querySelectorAll('input'));
  }

  it('focuses the same set reps input when Enter is pressed on weight', () => {
    const fixture = setup(true);
    const [weightA, repsA, weightB, repsB] = inputs(fixture.nativeElement);

    expect(weightA.getAttribute('enterkeyhint')).toBe('next');
    expect(repsA.getAttribute('enterkeyhint')).toBe('done');
    expect(repsA.dataset['setId']).toBe('10');
    expect(repsB.dataset['setId']).toBe('20');

    weightA.focus();
    const enterOnA = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    weightA.dispatchEvent(enterOnA);

    expect(enterOnA.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(repsA);

    const enterOnB = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    weightB.dispatchEvent(enterOnB);

    expect(enterOnB.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(repsB);
  });

  it('does not move focus for other keys on the weight input', () => {
    const fixture = setup(true);
    const [weightA] = inputs(fixture.nativeElement);

    weightA.focus();
    const digit = new KeyboardEvent('keydown', {
      key: '5',
      bubbles: true,
      cancelable: true,
    });
    weightA.dispatchEvent(digit);

    expect(digit.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(weightA);
  });

  it('does not render weight or reps inputs when the tracker is not editable', () => {
    const fixture = setup(false);
    expect(inputs(fixture.nativeElement)).toHaveLength(0);
  });

  it('still parses weight and reps edits without marking the set done', () => {
    const fixture = setup(true);
    const updates: { setId: number; updates: Partial<LoggedSet> }[] = [];
    fixture.componentInstance.setUpdated.subscribe((event) => updates.push(event));

    const [weightA, repsA] = inputs(fixture.nativeElement);

    weightA.value = '55.5';
    weightA.dispatchEvent(new Event('input'));
    repsA.value = '12';
    repsA.dispatchEvent(new Event('input'));
    weightA.value = '';
    weightA.dispatchEvent(new Event('input'));

    expect(updates).toEqual([
      { exerciseId: 7, setId: 10, updates: { weight_lifted: 55.5 } },
      { exerciseId: 7, setId: 10, updates: { reps_completed: 12 } },
      { exerciseId: 7, setId: 10, updates: { weight_lifted: undefined } },
    ]);
    expect(updates.every((event) => event.updates.completed_at === undefined)).toBe(true);
  });

  it('still toggles Done from the check button after focus moves', () => {
    const fixture = setup(true);
    const updates: { setId: number; updates: Partial<LoggedSet> }[] = [];
    fixture.componentInstance.setUpdated.subscribe((event) => updates.push(event));

    const [weightA] = inputs(fixture.nativeElement);
    weightA.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    );

    const done = fixture.nativeElement.querySelector(
      'button[title="Tap to mark as done"]',
    ) as HTMLButtonElement;
    done.click();
    fixture.detectChanges();

    expect(updates).toHaveLength(1);
    expect(updates[0].setId).toBe(10);
    expect(updates[0].updates.weight_lifted).toBe(40);
    expect(updates[0].updates.reps_completed).toBe(8);
    expect(updates[0].updates.completed_at).toEqual(expect.any(String));
  });
});

describe('ExerciseTracker session actions', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  function render(sessionActions: boolean, desktop: boolean) {
    TestBed.configureTestingModule({
      imports: [ExerciseTracker],
      providers: [
        provideRouter([]),
        provideZard(),
        { provide: PointerModeService, useValue: { isDesktop: signal(desktop) } },
      ],
    });

    const fixture = TestBed.createComponent(ExerciseTracker);
    fixture.componentRef.setInput('trackedExercise', trackedExercise([makeSet(10, 1)]));
    fixture.componentRef.setInput('editable', true);
    fixture.componentRef.setInput('sessionActions', sessionActions);
    fixture.detectChanges();
    return fixture;
  }

  it('shows a menu button on a fine pointer and hides the trash icon', () => {
    const fixture = render(true, true);
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('button[aria-label="Exercise actions"]')).not.toBeNull();
    expect(root.querySelector('.sr-only')).toBeNull();
    expect(root.querySelector('button[title="Remove exercise"]')).toBeNull();
    expect(root.textContent).not.toContain('Replace');
  });

  it('hides the menu button on touch and keeps a screen-reader action plus swipe buttons', () => {
    const fixture = render(true, false);
    const root = fixture.nativeElement as HTMLElement;
    const screenReader = root.querySelector('.sr-only');

    expect(screenReader?.textContent).toContain('Exercise actions');
    expect(root.querySelector('button[aria-label="Exercise actions"]')).toBeNull();
    expect(root.querySelector('button[title="Remove exercise"]')).toBeNull();
    expect(root.textContent).toContain('Replace');
    expect(root.textContent).toContain('Delete');
  });

  it('keeps the trash button when the card is only editing a logged session', () => {
    const fixture = render(false, false);
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('button[title="Remove exercise"]')).not.toBeNull();
    expect(root.querySelector('[data-testid="exercise-actions"]')).toBeNull();
    expect(root.textContent).not.toContain('Replace');
  });
});
