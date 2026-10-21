import { Component, input, output } from '@angular/core';
import { FloatingBlurComponent } from '@/shared/components/floating-blur/floating-blur';
import { WEIGHT_ADJUST_STEPS } from './keyboard-helper-bar.constants';

/** Presentational helper bar pinned above the mobile keyboard. */
@Component({
  selector: 'app-keyboard-helper-bar',
  standalone: true,
  imports: [FloatingBlurComponent],
  host: {
    'data-testid': 'keyboard-helper-bar',
    class: 'fixed inset-x-0 z-[1000] px-3 py-2 pointer-events-none motion-reduce:animate-none',
    '[style.bottom.px]': 'top() === null ? bottom() : null',
    '[style.top.px]': 'top()',
    '[class.-translate-y-full]': 'top() !== null',
    'animate.leave': 'helper-leave',
  },
  template: `
    <!-- Both modes stay mounted so a field switch crossfades instead of leave/enter. -->
    <app-floating-blur extendBottom="-100lvh">
      <div class="grid">
        <div
          data-testid="weight-chips"
          class="col-start-1 row-start-1 self-center flex gap-2 justify-center transition-opacity duration-100 ease-out motion-reduce:transition-none"
          [class.opacity-0]="mode() !== 'weight'"
          [class.layer-off]="mode() !== 'weight'"
          [class.layer-on]="mode() === 'weight'"
          [attr.inert]="mode() !== 'weight' ? '' : null"
          [attr.aria-hidden]="mode() !== 'weight' ? 'true' : null"
        >
          @for (step of weightSteps; track step; let i = $index) {
            <span
              animate.enter="helper-chip-in"
              class="flex shrink-0"
              [style.animation-delay.ms]="i * 20"
            >
              <button
                type="button"
                [attr.data-testid]="weightTestId(step)"
                class="min-w-14 h-10 px-4 rounded-full shadow-md font-mono font-bold text-base active:scale-95"
                [class]="
                  step < 0
                    ? 'bg-white text-neutral-900 border border-neutral-200'
                    : 'bg-[#BEF264] text-neutral-900'
                "
                (pointerdown)="tap($event, step)"
                (mousedown)="$event.preventDefault()"
              >
                {{ step < 0 ? '−' + -step : '+' + step }}
              </button>
            </span>
          }
        </div>
        <div
          data-testid="reps-chips"
          class="no-scrollbar col-start-1 row-start-1 self-center flex gap-2 overflow-x-auto py-2 -my-2 px-1 [&>*:first-child]:ml-auto [&>*:last-child]:mr-auto transition-opacity duration-100 ease-out motion-reduce:transition-none"
          [class.opacity-0]="mode() !== 'reps'"
          [class.layer-off]="mode() !== 'reps'"
          [class.layer-on]="mode() === 'reps'"
          [attr.inert]="mode() !== 'reps' ? '' : null"
          [attr.aria-hidden]="mode() !== 'reps' ? 'true' : null"
        >
          @for (c of chips(); track c; let i = $index) {
            <span
              animate.enter="helper-chip-in"
              class="shrink-0"
              [style.animation-delay.ms]="i * 20"
            >
              <button
                type="button"
                data-testid="reps-chip"
                class="min-w-14 h-10 px-4 rounded-full shadow-md font-mono font-bold text-base active:scale-95"
                [class]="
                  c === current()
                    ? 'bg-[#BEF264] text-neutral-900'
                    : 'bg-white text-neutral-900 border border-neutral-200'
                "
                (pointerdown)="tap($event, c)"
                (mousedown)="$event.preventDefault()"
              >
                {{ c }}
              </button>
            </span>
          }
        </div>
      </div>
    </app-floating-blur>
  `,
  styles: `
    .no-scrollbar {
      scrollbar-width: none;
    }
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .layer-on,
    .layer-on * {
      pointer-events: auto;
    }
    .layer-off,
    .layer-off * {
      pointer-events: none;
    }
    :host.helper-leave {
      animation: helper-leave 120ms ease-in both;
    }
    .helper-chip-in {
      animation: helper-chip-in 160ms ease-out both;
    }
    @keyframes helper-chip-in {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes helper-leave {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(8px);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      :host.helper-leave,
      .helper-chip-in {
        animation: none !important;
      }
    }
  `,
})
export class KeyboardHelperBar {
  mode = input.required<'weight' | 'reps'>();
  chips = input<number[]>([]);
  current = input<number | undefined>();

  /** Weight adjust steps shown left to right. */
  readonly weightSteps = WEIGHT_ADJUST_STEPS;

  weightTestId(step: number): string {
    const base = step < 0 ? 'weight-minus' : 'weight-plus';
    return Math.abs(step) === 5 ? base : `${base}-${Math.abs(step)}`;
  }

  bottom = input(0);

  /** When set, pins the bar's bottom edge to this Y (visual viewport bottom) using top + translateY(-100%). */
  top = input<number | null>(null);
  /** Weight mode: emits delta (±5). Reps mode: emits chip value. */
  readonly picked = output<number>();

  tap(event: Event, value: number) {
    /** keep input focus */
    event.preventDefault();
    this.picked.emit(value);
  }
}
