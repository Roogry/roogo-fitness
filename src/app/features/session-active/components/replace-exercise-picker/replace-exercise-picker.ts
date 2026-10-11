import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDumbbell, lucideSearch } from '@ng-icons/lucide';
import { filterExercisesByName } from '@/features/session-active/replace-exercise';
import { ZardBadgeComponent } from '@/shared/components/zard/badge';
import { ZardInputDirective } from '@/shared/components/zard/input';
import { Exercise } from '@/shared/models';

@Component({
  selector: 'app-replace-exercise-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, ZardBadgeComponent, ZardInputDirective],
  providers: [provideIcons({ lucideDumbbell, lucideSearch })],
  templateUrl: './replace-exercise-picker.html',
})
export class ReplaceExercisePicker {
  readonly exercises = input.required<readonly Exercise[]>();
  readonly picked = output<Exercise>();

  readonly query = signal('');

  readonly visibleExercises = computed(() => filterExercisesByName(this.exercises(), this.query()));

  onQueryChange(value: string) {
    this.query.set(value);
  }

  onPick(exercise: Exercise) {
    this.picked.emit(exercise);
  }
}
