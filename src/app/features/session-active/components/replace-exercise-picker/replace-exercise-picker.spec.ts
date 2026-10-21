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
    return Array.from(fixture.nativeElement.querySelectorAll('button'), (button: Element) =>
      (button.textContent ?? '').trim(),
    );
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

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'press';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

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
});
