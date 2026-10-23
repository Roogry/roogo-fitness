import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';

/** Row that offers to create a custom exercise from the current search text. */
@Component({
  selector: 'app-create-exercise-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  providers: [provideIcons({ lucidePlus })],
  templateUrl: './create-exercise-option.html',
})
export class CreateExerciseOption {
  readonly name = input.required<string>();
  readonly createClick = output<string>();

  onCreate() {
    this.createClick.emit(this.name());
  }
}
