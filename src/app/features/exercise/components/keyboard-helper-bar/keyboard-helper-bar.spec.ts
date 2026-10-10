import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Exercise, LoggedExercise, LoggedSet } from '@/shared/models';
import { ExerciseTracker } from '../exercise-tracker/exercise-tracker';
import { adjustWeight, repsChips } from './keyboard-helper-bar';
import {
  VisualViewportService,
  computeKeyboardOffset,
} from '@/core/services/visual-viewport.service';

describe('keyboard helper math', () => {
  it('adjusts weight, falls back to target then 0, clamps, keeps decimals', () => {
    expect(adjustWeight('42.5', 40, 5)).toBe(47.5);
    expect(adjustWeight('', 40, -5)).toBe(35);
    expect(adjustWeight('', undefined, 5)).toBe(5);
    expect(adjustWeight('3', 40, -5)).toBe(0);
  });
  it('switches reps chips above 50 kg', () => {
    expect(repsChips(50)).toEqual([8, 9, 10, 11, 12]);
    expect(repsChips(50.5)).toEqual([6, 7, 8, 9, 10]);
    expect(repsChips(undefined)).toEqual([8, 9, 10, 11, 12]);
  });
  it('computes keyboard offset', () => {
    expect(computeKeyboardOffset(800, { height: 500, offsetTop: 0 })).toBe(300);
    expect(computeKeyboardOffset(800, { height: 800, offsetTop: 10 })).toBe(0);
  });
});

describe('ExerciseTracker keyboard helper bar', () => {
  const exercise: Exercise = { id: 7, name: 'Bench', media: [] };
  function setup(sets: LoggedSet[]) {
    TestBed.configureTestingModule({
      imports: [ExerciseTracker],
      providers: [
        provideRouter([]),
        { provide: VisualViewportService, useValue: { keyboardOffset: signal(300), isTouch: true } },
      ],
    });
    const fixture = TestBed.createComponent(ExerciseTracker);
    const tracked: LoggedExercise = { id: 1, exercise, sets };
    fixture.componentRef.setInput('trackedExercise', tracked);
    fixture.componentRef.setInput('editable', true);
    const updates: any[] = [];
    fixture.componentInstance.setUpdated.subscribe((e) => updates.push(e));
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const [weight, reps] = Array.from(root.querySelectorAll('input'));
    const bar = () => document.querySelector('[data-testid="keyboard-helper-bar"]');
    return { fixture, weight, reps, bar, updates, root };
  }
  const press = (el: Element) =>
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));

  it('weight +5 updates via setUpdated and keeps focus', () => {
    const { fixture, weight, bar, updates } = setup([{ id: 10, set_number: 1, target_weight: 40 }]);
    document.body.appendChild(fixture.nativeElement);
    weight.focus();
    fixture.detectChanges();
    expect(bar()).toBeTruthy();
    const plus = document.querySelector('[data-testid="weight-plus"]')!;
    const ev = new PointerEvent('pointerdown', { bubbles: true, cancelable: true });
    plus.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
    expect(weight.value).toBe('45');
    expect(updates.at(-1).updates).toEqual({ weight_lifted: 45 });
    expect(document.activeElement).toBe(weight);
    fixture.nativeElement.remove();
  });

  it('reps chips switch at >50 kg, highlight current, and hide on blur', () => {
    const { fixture, reps, bar, updates } = setup([
      { id: 10, set_number: 1, weight_lifted: 60, target_reps: 8 },
    ]);
    document.body.appendChild(fixture.nativeElement);
    reps.focus();
    fixture.detectChanges();
    const chips = () => Array.from(document.querySelectorAll('[data-testid="reps-chip"]'));
    expect(chips().map((c) => c.textContent!.trim())).toEqual(['6', '7', '8', '9', '10']);
    expect(chips()[2].className).toContain('bg-[#BEF264]');
    press(chips()[4]);
    expect(reps.value).toBe('10');
    expect(updates.at(-1).updates).toEqual({ reps_completed: 10 });
    reps.blur();
    fixture.detectChanges();
    expect(bar()).toBeNull();
    fixture.nativeElement.remove();
  });

  it('is hidden when the set is done', () => {
    const { fixture, weight, bar } = setup([
      { id: 10, set_number: 1, weight_lifted: 40, reps_completed: 8, completed_at: 'x' },
    ]);
    document.body.appendChild(fixture.nativeElement);
    weight.focus();
    fixture.detectChanges();
    expect(bar()).toBeNull();
    fixture.nativeElement.remove();
  });
});
