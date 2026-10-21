import { Injectable, computed, signal } from '@angular/core';
import {
  KEYBOARD_OPEN_OFFSET_PX,
  KEYBOARD_REMEASURE_DELAYS_MS,
} from '@/core/utils/visual-viewport.constants';
import { computeKeyboardOffset } from '@/core/utils/visual-viewport.utils';

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

  constructor() {
    if (typeof document !== 'undefined') {
      const isTextField = (el: EventTarget | null) =>
        el instanceof HTMLElement &&
        (el.tagName === 'TEXTAREA' ||
          (el.tagName === 'INPUT' &&
            !['checkbox', 'radio', 'button', 'submit', 'range'].includes(
              (el as HTMLInputElement).type,
            )));
      document.addEventListener('focusin', (e) => this.textInputFocused.set(isTextField(e.target)));
      document.addEventListener('focusout', (e) => {
        if (!isTextField((e as FocusEvent).relatedTarget)) this.textInputFocused.set(false);
      });
    }
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!vv) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      this.keyboardOffset.set(computeKeyboardOffset(window.innerHeight, vv));
      this.visualBottom.set(Math.round(vv.offsetTop + vv.height));
    };
    const update = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    window.addEventListener('scroll', update, { passive: true });
    /** iOS animates the keyboard and page pan after focus; re-measure once it settles. */
    document.addEventListener('focusin', () => {
      update();
      for (const delay of KEYBOARD_REMEASURE_DELAYS_MS) {
        setTimeout(update, delay);
      }
    });
    apply();
  }
}
