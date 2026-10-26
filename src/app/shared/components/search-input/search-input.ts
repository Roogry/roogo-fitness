import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideX } from '@ng-icons/lucide';
import { ZardInputDirective } from '@/shared/components/zard/input';

/** Search field with a clear button that keeps the keyboard open. */
@Component({
  selector: 'app-search-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, ZardInputDirective],
  providers: [provideIcons({ lucideSearch, lucideX })],
  templateUrl: './search-input.html',
})
export class SearchInput {
  readonly value = input('');
  readonly placeholder = input('Search');
  readonly label = input('Search');
  readonly searching = input(false);
  readonly valueChange = output<string>();

  onValueChange(value: string): void {
    this.valueChange.emit(value);
  }

  /** Room on the right for the clear button, the spinner, or both. */
  fieldClass(): string {
    if (this.value() && this.searching()) return 'w-full pl-9 pr-20';
    if (this.value()) return 'w-full pl-9 pr-14';
    if (this.searching()) return 'w-full pl-9 pr-10';
    return 'w-full pl-9';
  }

  /**
   * Prevent the pointer from moving focus, then clear and focus the field.
   * iOS closes the keyboard when the field blurs.
   */
  onClear(field: HTMLInputElement): void {
    this.valueChange.emit('');
    field.focus();
  }
}
