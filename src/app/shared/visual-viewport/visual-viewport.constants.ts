/** Offset above this means the soft keyboard is covering the page. */
export const KEYBOARD_OPEN_OFFSET_PX = 40;

/** Custom property on the document root. Must match `--keyboard-inset` in `styles.css`. */
export const KEYBOARD_INSET_PROPERTY = '--keyboard-inset';

/**
 * iOS animates the keyboard and page pan after focus.
 * These delays re-measure once that animation has moved.
 */
export const KEYBOARD_REMEASURE_DELAYS_MS = [100, 350, 600] as const;
