import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Exercise } from '@/shared/models';
import { ReplaceExercisePicker } from './replace-exercise-picker';

function exercise(id: number, name: string): Exercise {
  return { id, name, media: [], primary_muscle: { id, name: 'Chest' } };
}

describe('ReplaceExercisePicker', () => {
  let fixture: ComponentFixture<ReplaceExercisePicker>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ReplaceExercisePicker] });
    fixture = TestBed.createComponent(ReplaceExercisePicker);
  });

  function names(): string[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('[data-testid="replace-exercise-option"]'),
      (button: Element) => (button.textContent ?? '').trim(),
    );
  }

  function typeQuery(value: string) {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  it('filters by name without changing the given order', () => {
    fixture.componentRef.setInput('exercises', [
      exercise(2, 'Incline Press'),
      exercise(4, 'Cable Fly'),
      exercise(3, 'Squat'),
    ]);
    fixture.detectChanges();

    expect(names().some((name) => name.includes('Incline Press'))).toBe(true);
    expect(names().some((name) => name.includes('Squat'))).toBe(true);

    typeQuery('press');

    expect(names().join(' ')).toContain('Incline Press');
    expect(names().join(' ')).not.toContain('Squat');
    expect(names().join(' ')).not.toContain('Cable Fly');
  });

  it('emits the exercise that was picked', () => {
    const incline = exercise(2, 'Incline Press');
    const picked: Exercise[] = [];
    fixture.componentInstance.picked.subscribe((exercise) => picked.push(exercise));
    fixture.componentRef.setInput('exercises', [incline]);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(picked).toEqual([incline]);
  });

  it('offers to create a name that is not in the list and emits it', () => {
    const created: string[] = [];
    fixture.componentInstance.createRequested.subscribe((name) => created.push(name));
    fixture.componentRef.setInput('exercises', [exercise(2, 'Incline Press')]);
    fixture.componentRef.setInput('sessionExerciseNames', ['Bench Press']);
    fixture.detectChanges();

    typeQuery('Zercher Squat');

    const button = fixture.nativeElement.querySelector(
      '[data-testid="create-exercise-option"]',
    ) as HTMLButtonElement;
    expect(button.textContent).toContain('Add "Zercher Squat"');
    expect(fixture.nativeElement.textContent).not.toContain('No other exercises to swap in.');

    button.click();

    expect(created).toEqual(['Zercher Squat']);
  });

  it('hides the create row for an exact match and for a name already in the session', () => {
    fixture.componentRef.setInput('exercises', [exercise(2, 'Incline Press')]);
    fixture.componentRef.setInput('sessionExerciseNames', ['Bench Press']);
    fixture.detectChanges();

    typeQuery('incline press');
    expect(
      fixture.nativeElement.querySelector('[data-testid="create-exercise-option"]'),
    ).toBeNull();
    expect(names().join(' ')).toContain('Incline Press');

    typeQuery('bench press');
    expect(
      fixture.nativeElement.querySelector('[data-testid="create-exercise-option"]'),
    ).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('No other exercises to swap in.');
  });

  it('shows the empty text only when nothing matches and nothing can be created', () => {
    fixture.componentRef.setInput('exercises', [exercise(2, 'Incline Press')]);
    fixture.detectChanges();

    typeQuery('   ');
    expect(
      fixture.nativeElement.querySelector('[data-testid="create-exercise-option"]'),
    ).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('No other exercises to swap in.');
    expect(names().join(' ')).toContain('Incline Press');

    fixture.componentRef.setInput('exercises', []);
    fixture.detectChanges();
    typeQuery('');
    expect(fixture.nativeElement.textContent).toContain('No other exercises to swap in.');
  });
});
