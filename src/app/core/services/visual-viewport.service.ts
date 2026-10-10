import { Injectable, computed, signal } from '@angular/core';

/**
 * Exposes the on-screen keyboard offset (px from layout viewport bottom to visual viewport bottom)
 * using the Visual Viewport API, so UI can be pinned to the top of the iOS keyboard.
 */
@Injectable({ providedIn: 'root' })
export class VisualViewportService {
  readonly keyboardOffset = signal(0);
  /** True while a text-entry field has focus (soft keyboard is likely open on touch devices). */
  readonly textInputFocused = signal(false);
  /** True when the soft keyboard is (likely) open; used to hide bottom chrome that would overlap the helper bar. */
  readonly keyboardOpen = computed(
    () => this.keyboardOffset() > 40 || (this.isTouch && this.textInputFocused()),
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
            !['checkbox', 'radio', 'button', 'submit', 'range'].includes((el as HTMLInputElement).type)));
      document.addEventListener('focusin', (e) => this.textInputFocused.set(isTextField(e.target)));
      document.addEventListener('focusout', (e) => {
        if (!isTextField((e as FocusEvent).relatedTarget)) this.textInputFocused.set(false);
      });
    }
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!vv) return;
    const update = () => this.keyboardOffset.set(computeKeyboardOffset(window.innerHeight, vv));
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
  }
}

export function computeKeyboardOffset(
  innerHeight: number,
  vv: { height: number; offsetTop: number },
): number {
  return Math.max(0, Math.round(innerHeight - (vv.height + vv.offsetTop)));
}
