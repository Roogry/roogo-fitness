import {
  booleanAttribute,
  computed,
  Directive,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  linkedSignal,
  model,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';

import type { ClassValue } from 'clsx';

import { mergeClasses, noopFn } from '@/shared/utils/merge-classes';

import {
  inputVariants,
  type ZardInputSizeVariants,
  type ZardInputStatusVariants,
  type ZardInputTypeVariants,
} from './input.variants';

type OnTouchedType = () => void;
type OnChangeType = (value: string) => void;

/**
 * A directive to style and enhance native input and textarea elements.
 * Integrates with Angular forms via ControlValueAccessor.
 * 
 * @example
 * <input z-input zSize="md" placeholder="Enter text" />
 */
@Directive({
  selector: 'input[z-input], textarea[z-input]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ZardInputDirective),
      multi: true,
    },
  ],
  host: {
    '[class]': 'classes()',
    '(input)': 'updateValue($event.target)',
    '(blur)': 'onBlur()',
  },
  exportAs: 'zInput',
})
export class ZardInputDirective implements ControlValueAccessor {
  private readonly elementRef = inject(ElementRef);
  private onTouched: OnTouchedType = noopFn;
  private onChangeFn: OnChangeType = noopFn;

  readonly class = input<ClassValue>('');
  readonly zBorderless = input(false, { transform: booleanAttribute });
  readonly zSize = input<ZardInputSizeVariants>('default');
  readonly zStatus = input<ZardInputStatusVariants>();
  readonly value = model<string>('');

  readonly size = linkedSignal<ZardInputSizeVariants>(() => this.zSize());

  protected readonly classes = computed(() =>
    mergeClasses(
      inputVariants({
        zType: this.getType(),
        zSize: this.size(),
        zStatus: this.zStatus(),
        zBorderless: this.zBorderless(),
      }),
      this.class(),
    ),
  );

  constructor() {
    effect(() => {
      const value = this.value();

      if (value !== undefined && value !== null) {
        this.elementRef.nativeElement.value = value;
      }
    });
  }

  /**
   * Disables or enables the underlying input element.
   * 
   * @param b True to disable, false to enable.
   */
  disable(b: boolean): void {
    this.elementRef.nativeElement.disabled = b;
  }

  /**
   * Sets the dataset slot property on the host element.
   * 
   * @param name The slot name.
   */
  setDataSlot(name: string): void {
    if (this.elementRef?.nativeElement?.dataset) {
      this.elementRef.nativeElement.dataset.slot = name;
    }
  }

  protected updateValue(target: EventTarget | null): void {
    const el = target as HTMLInputElement | HTMLTextAreaElement | null;
    this.value.set(el?.value ?? '');
    this.onChangeFn(this.value());
  }

  protected onBlur() {
    this.onTouched();
  }

  /**
   * Gets the type of the input element (either textarea or default).
   */
  getType(): ZardInputTypeVariants {
    const isTextarea = this.elementRef.nativeElement.tagName.toLowerCase() === 'textarea';
    return isTextarea ? 'textarea' : 'default';
  }

  registerOnChange(fn: OnChangeType): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: OnTouchedType): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disable(isDisabled);
  }

  writeValue(value?: string): void {
    const newValue = value ?? '';
    this.value.set(newValue);
    this.elementRef.nativeElement.value = newValue;
  }
}
