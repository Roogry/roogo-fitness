import { Injectable, computed, signal } from '@angular/core';
import {
  KEYBOARD_INSET_PROPERTY,
  KEYBOARD_OPEN_OFFSET_PX,
  KEYBOARD_REMEASURE_DELAYS_MS,
} from '@/shared/visual-viewport/visual-viewport.constants';
import { computeKeyboardOffset } from '@/shared/visual-viewport/visual-viewport.utils';

/**
 * Writes the on-screen keyboard inset to the document root as `--keyboard-inset`.
 *
 * `dvh`, `interactive-widget=resizes-content`, and `env(keyboard-inset-height)` do not
 * update on iOS Safari, so this listener stays. `keyboardOffset` and `visualBottom` remain
 * for the helper bar and the session bar, which pin themselves to the keyboard.
 */
@Injectable({ providedIn: 'root' })
export class VisualViewportService {
  readonly keyboardOffset = signal(0);
  /**
   * Y (px, layout-viewport coordinates) of the visible bottom edge, i.e. the top of the keyboard.
   * Used with `position: fixed; top` so the bar stays glued to the keyboard even when iOS pans
   * the layout viewport (e.g. focusing the last input at the bottom of the page).
   */
  readonly visualBottom = signal(typeof window !== 'undefined' ? window.innerHeight : 0);
  /** True while a text-entry field has focus (soft keyboard is likely open on touch devices). */
  readonly textInputFocused = signal(false);
  /** True when the soft keyboard is (likely) open; used to hide bottom chrome that would overlap the helper bar. */
  readonly keyboardOpen = computed(
    () =>
      this.keyboardOffset() > KEYBOARD_OPEN_OFFSET_PX || (this.isTouch && this.textInputFocused()),
  );
  readonly isTouch =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || (navigator?.maxTouchPoints ?? 0) > 0);

  private readonly viewportEl: VisualViewport | null =
    typeof window !== 'undefined' ? window.visualViewport : null;
  private remeasureTimerIds: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    if (typeof document !== 'undefined') {
      const isTextField = (el: EventTarget | null) =>
        el instanceof HTMLElement &&
        (el.tagName === 'TEXTAREA' ||
          (el.tagName === 'INPUT' &&
            !['checkbox', 'radio', 'button', 'submit', 'range'].includes(
              (el as HTMLInputElement).type,
            )));
      document.addEventListener('focusin', (event) =>
        this.textInputFocused.set(isTextField(event.target)),
      );
      document.addEventListener('focusout', (event: FocusEvent) => {
        if (!isTextField(event.relatedTarget)) this.textInputFocused.set(false);
      });
    }

    const viewport = this.viewportEl;
    if (!viewport) {
      this.publishInset(0);
      return;
    }

    const onViewport = () => this.applyViewport();
    viewport.addEventListener('resize', onViewport);
    viewport.addEventListener('scroll', onViewport);
    window.addEventListener('scroll', onViewport, { passive: true });
    document.addEventListener('focusin', () => this.remeasure());
    this.applyViewport();
  }

  /**
   * Read the inset now, then again after iOS has finished moving the keyboard.
   * A sheet's content can resize without a viewport event, and the pan lands later.
   * The previous timers are cleared so a burst of resizes does not stack reads.
   */
  remeasure(): void {
    this.clearRemeasureTimers();
    this.applyViewport();
    for (const delay of KEYBOARD_REMEASURE_DELAYS_MS) {
      this.remeasureTimerIds.push(setTimeout(() => this.applyViewport(), delay));
    }
  }

  private clearRemeasureTimers(): void {
    for (const timerId of this.remeasureTimerIds) clearTimeout(timerId);
    this.remeasureTimerIds = [];
  }

  /**
   * Read the visual viewport in the event.
   * The first iOS keyboard open queues one animation frame and then drops it. While that frame
   * is pending, later resize and scroll events are ignored, so a read deferred to that frame
   * never sees the keyboard height and the inset stays 0 until the keyboard is opened again.
   */
  private applyViewport(): void {
    const viewport = this.viewportEl;
    if (!viewport || typeof window === 'undefined') {
      this.publishInset(0);
      return;
    }
    const offset = computeKeyboardOffset(window.innerHeight, viewport);
    this.keyboardOffset.set(offset);
    this.visualBottom.set(Math.round(viewport.offsetTop + viewport.height));
    this.publishInset(offset);
  }

  private publishInset(offsetPx: number): void {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty(KEYBOARD_INSET_PROPERTY, `${offsetPx}px`);
  }
}
