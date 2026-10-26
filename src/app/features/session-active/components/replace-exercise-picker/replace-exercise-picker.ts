import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDumbbell } from '@ng-icons/lucide';
import { CreateExerciseOption } from '@/features/exercise/components/create-exercise-option/create-exercise-option';
import {
  filterExercisesByName,
  hasExactNameMatch,
} from '@/features/session-active/replace-exercise.utils';
import { SearchInput } from '@/shared/components/search-input/search-input';
import { sheetLeaveMs } from '@/shared/components/sheet/sheet.utils';
import { ZardBadgeComponent } from '@/shared/components/zard/badge';
import { Exercise } from '@/shared/models';

@Component({
  selector: 'app-replace-exercise-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, ZardBadgeComponent, CreateExerciseOption, SearchInput],
  providers: [provideIcons({ lucideDumbbell })],
  templateUrl: './replace-exercise-picker.html',
})
export class ReplaceExercisePicker {
  readonly exercises = input.required<readonly Exercise[]>();
  /** Names already in the session, including the exercise being replaced. */
  readonly sessionExerciseNames = input<readonly string[]>([]);
  /** False after the hosting sheet starts to close. The search resets once that animation ends. */
  readonly active = input(true);
  readonly picked = output<Exercise>();
  readonly createRequested = output<string>();

  readonly query = signal('');
  /** Projected content is created while the sheet is still closed, so the first inactive state is not a close. */
  private hasBeenOpen = false;

  constructor() {
    effect((onCleanup) => {
      if (this.active()) {
        this.hasBeenOpen = true;
        return;
      }
      if (!this.hasBeenOpen) return;
      const timer = setTimeout(() => this.resetSearch(), sheetLeaveMs());
      onCleanup(() => clearTimeout(timer));
    });
  }

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

  resetSearch(): void {
    this.query.set('');
  }

  onPick(exercise: Exercise) {
    this.picked.emit(exercise);
  }

  onCreate(name: string) {
    this.createRequested.emit(name);
  }
}
