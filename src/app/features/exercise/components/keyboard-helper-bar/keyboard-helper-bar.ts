import { Component, input, output } from '@angular/core';

/** Presentational helper bar pinned above the mobile keyboard. */
@Component({
  selector: 'app-keyboard-helper-bar',
  standalone: true,
  template: `
    <div
      data-testid="keyboard-helper-bar"
      class="fixed inset-x-0 z-[1000] px-3 py-2 pointer-events-none"
      [style.bottom.px]="bottom()"
    >
      @if (mode() === 'weight') {
        <div class="flex gap-2 justify-center">
          <button type="button" data-testid="weight-minus"
            class="flex-1 max-w-40 h-10 rounded-full bg-white text-neutral-900 border border-neutral-200 shadow-md pointer-events-auto font-mono font-bold text-base active:scale-95"
            (pointerdown)="tap($event, -5)" (mousedown)="$event.preventDefault()">−5</button>
          <button type="button" data-testid="weight-plus"
            class="flex-1 max-w-40 h-10 rounded-full bg-[#BEF264] text-neutral-900 shadow-md pointer-events-auto font-mono font-bold text-base active:scale-95"
            (pointerdown)="tap($event, 5)" (mousedown)="$event.preventDefault()">+5</button>
        </div>
      } @else {
        <div class="no-scrollbar flex gap-2 overflow-x-auto pointer-events-auto py-2 -my-2 px-1 [&>*:first-child]:ml-auto [&>*:last-child]:mr-auto">
          @for (c of chips(); track c) {
            <button type="button" data-testid="reps-chip"
              class="shrink-0 min-w-14 h-10 px-4 rounded-full shadow-md pointer-events-auto font-mono font-bold text-base active:scale-95"
              [class]="c === current() ? 'bg-[#BEF264] text-neutral-900' : 'bg-white text-neutral-900 border border-neutral-200'"
              (pointerdown)="tap($event, c)" (mousedown)="$event.preventDefault()">{{ c }}</button>
          }
        </div>
      }
    </div>
  `,
  styles: `.no-scrollbar{scrollbar-width:none}.no-scrollbar::-webkit-scrollbar{display:none}`,
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
