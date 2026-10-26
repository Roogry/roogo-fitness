import { SHEET_LEAVE_MS } from './sheet.constants';

/** Shorter when the user prefers reduced motion, so the sheet does not linger off screen. */
export function sheetLeaveMs(): number {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return SHEET_LEAVE_MS;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;
  return SHEET_LEAVE_MS;
}
