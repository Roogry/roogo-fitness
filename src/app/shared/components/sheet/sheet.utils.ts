import { SHEET_MAX_HEIGHT_VH } from './sheet.constants';

/**
 * With the keyboard open, shrink the sheet by the keyboard height so its bottom sits on the keyboard
 * and its top stays where it was. Returns null when closed, so the Tailwind max-h classes apply.
 * The visual viewport cap keeps a tall sheet from growing past the visible screen.
 */
export function sheetMaxHeightAboveKeyboard(
  keyboardOffsetPx: number,
  visualHeightPx = 0,
): string | null {
  if (keyboardOffsetPx <= 0) return null;
  const lifted = `calc(${SHEET_MAX_HEIGHT_VH}vh - ${keyboardOffsetPx}px)`;
  if (visualHeightPx <= 0) return lifted;
  return `min(${Math.round(visualHeightPx)}px, ${lifted})`;
}
