import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDumbbell, lucideSearch } from '@ng-icons/lucide';
import { CreateExerciseOption } from '@/features/exercise/components/create-exercise-option/create-exercise-option';
import {
  filterExercisesByName,
  hasExactNameMatch,
} from '@/features/session-active/replace-exercise.utils';
import { ZardBadgeComponent } from '@/shared/components/zard/badge';
import { ZardInputDirective } from '@/shared/components/zard/input';
import { Exercise } from '@/shared/models';

@Component({
  selector: 'app-replace-exercise-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, ZardBadgeComponent, ZardInputDirective, CreateExerciseOption],
  providers: [provideIcons({ lucideDumbbell, lucideSearch })],
  templateUrl: './replace-exercise-picker.html',
})
export class ReplaceExercisePicker {
  readonly exercises = input.required<readonly Exercise[]>();
  /** Names already in the session, including the exercise being replaced. */
  readonly sessionExerciseNames = input<readonly string[]>([]);
  readonly picked = output<Exercise>();
  readonly createRequested = output<string>();

  readonly query = signal('');

  readonly visibleExercises = computed(() => filterExercisesByName(this.exercises(), this.query()));
  readonly trimmedQuery = computed(() => this.query().trim());
  readonly canCreate = computed(() => {
    const name = this.trimmedQuery();
    if (!name) return false;
    if (hasExactNameMatch(this.exercises(), name)) return false;
    return !this.sessionExerciseNames().some((taken) => taken.toLowerCase() === name.toLowerCase());
  });

  onQueryChange(value: string) {
    this.query.set(value);
  }

  onPick(exercise: Exercise) {
    this.picked.emit(exercise);
  }

  onCreate(name: string) {
    this.createRequested.emit(name);
  }
}
