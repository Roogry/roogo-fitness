import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';

import type { ClassValue } from 'clsx';

import {
  formControlVariants,
  formFieldVariants,
  formLabelVariants,
  formMessageVariants,
  type ZardFormMessageTypeVariants,
} from '@/shared/components/zard/form/form.variants';
import { mergeClasses } from '@/shared/utils/merge-classes';

/**
 * A wrapper component for an entire form field, including its label and control.
 * 
 * @example
 * <z-form-field>
 *   <z-form-label>Name</z-form-label>
 *   <z-form-control><input z-input /></z-form-control>
 * </z-form-field>
 */
@Component({
  selector: 'z-form-field, [z-form-field]',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
  },
  exportAs: 'zFormField',
})
export class ZardFormFieldComponent {
  readonly class = input<ClassValue>('');

  protected readonly classes = computed(() => mergeClasses(formFieldVariants(), this.class()));
}

/**
 * A wrapper for a form control that handles layout and validation messages.
 * 
 * @example
 * <z-form-control errorMessage="Required field">
 *   <input z-input />
 * </z-form-control>
 */
@Component({
  selector: 'z-form-control, [z-form-control]',
  imports: [],
  template: `
    <div class="relative">
      <ng-content />
    </div>
    @if (errorMessage() || helpText()) {
      <div class="mt-1.5 min-h-5">
        @if (errorMessage()) {
          <p class="text-sm text-red-500">{{ errorMessage() }}</p>
        } @else if (helpText()) {
          <p class="text-muted-foreground text-sm">{{ helpText() }}</p>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
  },
  exportAs: 'zFormControl',
})
export class ZardFormControlComponent {
  readonly class = input<ClassValue>('');
  readonly errorMessage = input<string>('');
  readonly helpText = input<string>('');

  protected readonly classes = computed(() => mergeClasses(formControlVariants(), this.class()));
}

/**
 * A label component specifically styled for form fields.
 * 
 * @example
 * <z-form-label [zRequired]="true">Email</z-form-label>
 */
@Component({
  selector: 'z-form-label, label[z-form-label]',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
  },
  exportAs: 'zFormLabel',
})
export class ZardFormLabelComponent {
  readonly class = input<ClassValue>('');
  readonly zRequired = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() =>
    mergeClasses(formLabelVariants({ zRequired: this.zRequired() }), this.class()),
  );
}

/**
 * A component to display validation messages or help text.
 * 
 * @example
 * <z-form-message zType="error">Invalid email</z-form-message>
 */
@Component({
  selector: 'z-form-message, [z-form-message]',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
  },
  exportAs: 'zFormMessage',
})
export class ZardFormMessageComponent {
  readonly class = input<ClassValue>('');
  readonly zType = input<ZardFormMessageTypeVariants>('default');

  protected readonly classes = computed(() => mergeClasses(formMessageVariants({ zType: this.zType() }), this.class()));
}
