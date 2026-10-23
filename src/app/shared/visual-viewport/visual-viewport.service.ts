import { Injectable, computed, signal } from '@angular/core';
import {
  KEYBOARD_OPEN_OFFSET_PX,
  KEYBOARD_REMEASURE_DELAYS_MS,
} from '@/shared/visual-viewport/visual-viewport.constants';
import { computeKeyboardOffset } from '@/shared/visual-viewport/visual-viewport.utils';

/**
 * Exposes the on-screen keyboard offset (px from layout viewport bottom to visual viewport bottom)
 * using the Visual Viewport API, so UI can be pinned to the top of the iOS keyboard.
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
  /** Height of the visual viewport in px. Sheets use this so they never grow past the visible screen. */
  readonly visualHeight = signal(readVisualHeight());
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
    if (!viewport) return;

    const onViewport = () => this.applyViewport();
    viewport.addEventListener('resize', onViewport);
    viewport.addEventListener('scroll', onViewport);
    window.addEventListener('scroll', onViewport, { passive: true });
    /**
     * iOS animates the keyboard and page pan after focus. The resize that follows can still
     * report the pre-keyboard height, so re-measure once that animation has moved.
     */
    document.addEventListener('focusin', () => {
      onViewport();
      for (const delay of KEYBOARD_REMEASURE_DELAYS_MS) {
        setTimeout(onViewport, delay);
      }
    });
    this.applyViewport();
  }

  /**
   * Read the visual viewport in the event.
   * The first iOS keyboard open queues one animation frame and then drops it. While that frame
   * is pending, later resize and scroll events are ignored, so the read that has the keyboard
   * height never runs and `keyboardOffset` stays 0 until the keyboard is opened again.
   */
  private applyViewport(): void {
    const viewport = this.viewportEl;
    if (!viewport || typeof window === 'undefined') return;
    this.keyboardOffset.set(computeKeyboardOffset(window.innerHeight, viewport));
    this.visualBottom.set(Math.round(viewport.offsetTop + viewport.height));
    this.visualHeight.set(Math.round(viewport.height));
  }
}

function readVisualHeight(): number {
  if (typeof window === 'undefined') return 0;
  return Math.round(window.visualViewport?.height ?? window.innerHeight);
}
