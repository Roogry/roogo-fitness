import { DESKTOP_POINTER_QUERY } from './pointer-mode.constants';

export function isDesktopPointer(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(DESKTOP_POINTER_QUERY).matches;
}
