import { Component, input } from '@angular/core';

/**
 * Wraps floating UI (session bar, home widget, keyboard helper) with a gradient fade to the page
 * background (no backdrop-filter, for smooth scrolling on iOS).
 * The blur starts 24px above the wrapped content (fully transparent), is 60% at the content's top
 * edge, and fully hides the content behind it at the content's vertical middle. From the middle down it stays fully hidden
 * until `extendBottom` below the wrapper.
 *
 * @example
 * <app-floating-blur extendBottom="-2rem"><div class="...">floating bar</div></app-floating-blur>
 */
@Component({
  selector: 'app-floating-blur',
  standalone: true,
  host: { class: 'relative isolate block' },
  template: `
    <!-- Ramp: starts 24px above the content (opacity 0), 60% at the content's top edge, 100% at its middle. -->
    <div
      aria-hidden="true"
      data-testid="floating-blur-ramp"
      class="pointer-events-none absolute -inset-x-[100vw] -z-10"
      style="
        top: calc(-1 * var(--floating-blur-lead, 24px));
        height: calc(50% + var(--floating-blur-lead, 24px));
        background: linear-gradient(
          to bottom,
          transparent 0px,
          color-mix(in srgb, var(--background) 60%, transparent) var(--floating-blur-lead, 24px),
          var(--background) 100%
        );
      "
    ></div>
    <!-- Solid: middle down to extendBottom, content fully hidden. -->
    <div
      aria-hidden="true"
      data-testid="floating-blur-backdrop"
      class="pointer-events-none absolute -inset-x-[100vw] top-1/2 -z-10"
      style="background: var(--background)"
      [style.bottom]="extendBottom()"
    ></div>
    <ng-content />
  `,
})
export class FloatingBlurComponent {
  /** How far below the wrapped element the blur keeps hiding content (CSS length, usually negative). */
  readonly extendBottom = input<string>('0px');
}
