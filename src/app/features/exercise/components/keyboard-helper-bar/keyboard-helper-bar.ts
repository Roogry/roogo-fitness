import { Component, input, output } from '@angular/core';

/** Presentational helper bar pinned above the mobile keyboard. */
@Component({
  selector: 'app-keyboard-helper-bar',
  standalone: true,
  host: {
    'data-testid': 'keyboard-helper-bar',
    class: 'fixed inset-x-0 z-[1000] px-3 py-2 pointer-events-none motion-reduce:animate-none',
    '[style.bottom.px]': 'bottom()',
    'animate.leave': 'helper-leave',
  },
  template: `
    <!-- Both modes stay mounted so a field switch crossfades instead of leave/enter. -->
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
        <span
          animate.enter="helper-chip-in"
          class="flex flex-1 max-w-40"
          style="animation-delay: 0ms"
        >
          <button
            type="button"
            data-testid="weight-minus"
            class="w-full h-10 rounded-full bg-white text-neutral-900 border border-neutral-200 shadow-md font-mono font-bold text-base active:scale-95"
            (pointerdown)="tap($event, -5)"
            (mousedown)="$event.preventDefault()"
          >
            −5
          </button>
        </span>
        <span
          animate.enter="helper-chip-in"
          class="flex flex-1 max-w-40"
          style="animation-delay: 20ms"
        >
          <button
            type="button"
            data-testid="weight-plus"
            class="w-full h-10 rounded-full bg-[#BEF264] text-neutral-900 shadow-md font-mono font-bold text-base active:scale-95"
            (pointerdown)="tap($event, 5)"
            (mousedown)="$event.preventDefault()"
          >
            +5
          </button>
        </span>
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
          <span animate.enter="helper-chip-in" class="shrink-0" [style.animation-delay.ms]="i * 20">
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
  bottom = input(0);
  /** Weight mode: emits delta (±5). Reps mode: emits chip value. */
  readonly picked = output<number>();

  tap(event: Event, value: number) {
    event.preventDefault(); // keep input focus
    this.picked.emit(value);
  }
}

export function adjustWeight(current: string, target: number | undefined, delta: number): number {
  const parsed = current === '' ? NaN : parseFloat(current);
  const base = isNaN(parsed) ? (target ?? 0) : parsed;
  return Math.max(0, Math.round((base + delta) * 1000) / 1000);
}

export function repsChips(weight: number | undefined): number[] {
  return (weight ?? 0) > 50 ? [6, 7, 8, 9, 10] : [8, 9, 10, 11, 12];
}
