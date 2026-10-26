import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZard } from '@/core/provider/providezard';
import { ExerciseService } from '@/core/services/exercise.service';
import { RooSheetComponent } from '@/shared/components/sheet/sheet';
import { SHEET_LEAVE_MS } from '@/shared/components/sheet/sheet.constants';
import { Exercise } from '@/shared/models';
import { ExerciseAutocomplete } from './exercise-autocomplete';

const bench: Exercise = { id: 1, name: 'Bench Press', media: [] };

@Component({
  imports: [RooSheetComponent, ExerciseAutocomplete],
  template: `
    <app-sheet [isOpen]="open()" (onOpenChange)="open.set($event)" title="Add Exercise">
      <app-exercise-autocomplete [active]="open()" />
    </app-sheet>
  `,
})
class AddSheetHost {
  readonly open = signal(false);
}

describe('ExerciseAutocomplete', () => {
  const getExercises = vi.fn();

  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  function type(fixture: ComponentFixture<ExerciseAutocomplete>, value: string) {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  async function flushMicrotasks() {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  }

  it('keeps the previous results and the create card while the next search loads', async () => {
    vi.useFakeTimers();
    let resolveNext: (rows: Exercise[]) => void = () => undefined;
    getExercises.mockImplementation((query: string) => {
      if (!query.trim()) return Promise.resolve([bench]);
      return new Promise<Exercise[]>((resolve) => {
        resolveNext = resolve;
      });
    });

    TestBed.configureTestingModule({
      imports: [ExerciseAutocomplete],
      providers: [{ provide: ExerciseService, useValue: { getExercises } }],
    });
    const fixture = TestBed.createComponent(ExerciseAutocomplete);
    fixture.detectChanges();
    await flushMicrotasks();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Bench Press');
    expect(
      fixture.nativeElement.querySelector('[data-testid="create-exercise-option"]'),
    ).toBeNull();

    type(fixture, 'zzz');
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Bench Press');
    expect(fixture.nativeElement.textContent).toContain('Add "zzz"');
    expect(fixture.nativeElement.querySelector('[data-testid="search-spinner"]')).not.toBeNull();

    resolveNext([]);
    await flushMicrotasks();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Bench Press');
    expect(
      fixture.nativeElement.querySelector('[data-testid="create-exercise-option"]'),
    ).not.toBeNull();
  });

  it('shows the full list as soon as a loaded search is cleared', async () => {
    vi.useFakeTimers();
    getExercises.mockResolvedValue([bench]);
    TestBed.configureTestingModule({
      imports: [ExerciseAutocomplete],
      providers: [{ provide: ExerciseService, useValue: { getExercises } }],
    });
    const fixture = TestBed.createComponent(ExerciseAutocomplete);
    fixture.detectChanges();
    await flushMicrotasks();
    fixture.detectChanges();

    type(fixture, 'zzz');
    await vi.advanceTimersByTimeAsync(300);
    await flushMicrotasks();
    fixture.detectChanges();

    type(fixture, '');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Bench Press');
    expect(
      fixture.nativeElement.querySelector('[data-testid="create-exercise-option"]'),
    ).toBeNull();
    expect(fixture.nativeElement.querySelector('input').value).toBe('');
  });

  it('resets the search after the sheet finishes closing', async () => {
    vi.useFakeTimers();
    getExercises.mockResolvedValue([bench]);
    TestBed.configureTestingModule({
      imports: [AddSheetHost],
      providers: [provideZard(), { provide: ExerciseService, useValue: { getExercises } }],
    });
    const fixture = TestBed.createComponent(AddSheetHost);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();
    await flushMicrotasks();
    fixture.detectChanges();

    const input = () => fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input().value = 'bench';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(input().value).toBe('bench');

    fixture.componentInstance.open.set(false);
    fixture.detectChanges();
    TestBed.flushEffects();
    expect(input().value).toBe('bench');

    await vi.advanceTimersByTimeAsync(SHEET_LEAVE_MS);
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(input().value).toBe('');
    expect(fixture.nativeElement.textContent).toContain('Bench Press');
  });
});
