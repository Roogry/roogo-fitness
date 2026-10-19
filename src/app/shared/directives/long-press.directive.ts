import {
  booleanAttribute,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
} from '@angular/core';

export const LONG_PRESS_MS = 500;
export const LONG_PRESS_CANCEL_PX = 10;
const HAPTIC_DURATION_MS = 10;

// The reorder handle has its own press, and inputs need the touch for the caret.
const LONG_PRESS_IGNORE_SELECTOR =
  'input, textarea, select, button, [cdkDragHandle], [data-drag-handle]';

/**
 * Fires after a still touch on coarse pointers. Mouse presses do not count:
 * this listens to touch events only, so a fine pointer never opens the menu.
 */
@Directive({
  selector: '[appLongPress]',
})
export class LongPressDirective implements OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly enabled = input(true, { alias: 'appLongPress', transform: booleanAttribute });
  readonly longPress = output<void>();
  /** True from touch-down until the press fires or is cancelled. */
  readonly pressingChange = output<boolean>();

  private timer: ReturnType<typeof setTimeout> | undefined;
  private startX = 0;
  private startY = 0;
  private suppressClick = false;
  private pressing = false;

  private readonly onTouchStart = (event: TouchEvent) => {
    if (!this.enabled() || event.touches.length !== 1) return;
    if (isIgnoredLongPressTarget(event.target)) return;

    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;
    this.clearTimer();
    this.pressing = true;
    this.pressingChange.emit(true);
    this.timer = setTimeout(() => this.fire(), LONG_PRESS_MS);
  };

  private readonly onTouchMove = (event: TouchEvent) => {
    if (this.timer === undefined || event.touches.length !== 1) return;
    const dx = event.touches[0].clientX - this.startX;
    const dy = event.touches[0].clientY - this.startY;
    const moved = Math.abs(dx) > LONG_PRESS_CANCEL_PX || Math.abs(dy) > LONG_PRESS_CANCEL_PX;
    if (!moved) return;
    this.clearTimer();
  };

  private readonly onTouchEnd = (event: TouchEvent) => {
    this.clearTimer();
    if (!this.suppressClick) return;
    event.preventDefault();
  };

  private readonly onClick = (event: Event) => {
    if (!this.suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
    this.suppressClick = false;
  };

  private readonly onContextMenu = (event: Event) => {
    if (!this.enabled()) return;
    event.preventDefault();
  };

  constructor() {
    // Another card taking the press disables this one. Drop the timer so it cannot still fire.
    effect(() => {
      if (this.enabled()) return;
      this.clearTimer();
    });

    const element = this.host.nativeElement;
    element.addEventListener('touchstart', this.onTouchStart, { passive: true });
    element.addEventListener('touchmove', this.onTouchMove, { passive: true });
    element.addEventListener('touchend', this.onTouchEnd);
    element.addEventListener('touchcancel', this.onTouchEnd);
    element.addEventListener('click', this.onClick, true);
    element.addEventListener('contextmenu', this.onContextMenu);
  }

  ngOnDestroy() {
    this.clearTimer();
    const element = this.host.nativeElement;
    element.removeEventListener('touchstart', this.onTouchStart);
    element.removeEventListener('touchmove', this.onTouchMove);
    element.removeEventListener('touchend', this.onTouchEnd);
    element.removeEventListener('touchcancel', this.onTouchEnd);
    element.removeEventListener('click', this.onClick, true);
    element.removeEventListener('contextmenu', this.onContextMenu);
  }

  private fire() {
    this.timer = undefined;
    this.suppressClick = true;
    this.endPress();
    pulseHaptic();
    this.longPress.emit();
  }

  private clearTimer() {
    if (this.timer === undefined) return;
    clearTimeout(this.timer);
    this.timer = undefined;
    this.endPress();
  }

  private endPress() {
    if (!this.pressing) return;
    this.pressing = false;
    this.pressingChange.emit(false);
  }
}

function isIgnoredLongPressTarget(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest(LONG_PRESS_IGNORE_SELECTOR);
}

/** iOS Safari has no vibrate API. Other browsers get a short pulse. */
function pulseHaptic() {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  navigator.vibrate(HAPTIC_DURATION_MS);
}
