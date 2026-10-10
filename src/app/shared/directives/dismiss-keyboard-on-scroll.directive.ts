import { Directive, ElementRef, OnDestroy, inject } from '@angular/core';

/** Vertical travel past this dismisses the keyboard. A smaller nudge does not. */
const DISMISS_DRAG_PX = 10;

/**
 * Blurs the focused field when the user drags to scroll, matching iOS.
 * Listens for touch drags rather than `scroll`: iOS scrolls the page on its own
 * when an input is focused, and that would close the keyboard immediately.
 * Gestures that start on the keyboard helper (sideways reps chips) and mostly
 * horizontal drags are ignored. Chip taps never move far enough to dismiss.
 */
@Directive({
  selector: '[appDismissKeyboardOnScroll]',
  standalone: true,
})
export class DismissKeyboardOnScroll implements OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private startX = 0;
  private startY = 0;
  private tracking = false;

  private readonly onTouchStart = (event: TouchEvent) => {
    if (event.touches.length !== 1 || isInsideKeyboardHelper(event.target)) {
      this.tracking = false;
      return;
    }
    this.tracking = true;
    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;
  };

  private readonly onTouchMove = (event: TouchEvent) => {
    if (!this.tracking || event.touches.length !== 1) return;
    const dx = event.touches[0].clientX - this.startX;
    const dy = event.touches[0].clientY - this.startY;
    if (Math.abs(dx) > Math.abs(dy) || Math.abs(dy) <= DISMISS_DRAG_PX) return;
    this.tracking = false;
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
  };

  private readonly onTouchEnd = () => {
    this.tracking = false;
  };

  constructor() {
    const el = this.host.nativeElement;
    el.addEventListener('touchstart', this.onTouchStart, { passive: true });
    el.addEventListener('touchmove', this.onTouchMove, { passive: true });
    el.addEventListener('touchend', this.onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', this.onTouchEnd, { passive: true });
  }

  ngOnDestroy() {
    const el = this.host.nativeElement;
    el.removeEventListener('touchstart', this.onTouchStart);
    el.removeEventListener('touchmove', this.onTouchMove);
    el.removeEventListener('touchend', this.onTouchEnd);
    el.removeEventListener('touchcancel', this.onTouchEnd);
  }
}

function isInsideKeyboardHelper(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    !!target.closest('app-keyboard-helper-bar, [data-testid="keyboard-helper-bar"]')
  );
}
