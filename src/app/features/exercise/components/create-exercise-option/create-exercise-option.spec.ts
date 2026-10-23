import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateExerciseOption } from './create-exercise-option';

describe('CreateExerciseOption', () => {
  let fixture: ComponentFixture<CreateExerciseOption>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CreateExerciseOption] });
    fixture = TestBed.createComponent(CreateExerciseOption);
  });

  it('renders the name and emits it when clicked', () => {
    const created: string[] = [];
    fixture.componentInstance.createClick.subscribe((name) => created.push(name));
    fixture.componentRef.setInput('name', 'Zercher Squat');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.textContent).toContain('Add "Zercher Squat"');
    expect(button.textContent).toContain('Create a new custom exercise');

    button.click();

    expect(created).toEqual(['Zercher Squat']);
  });
});
