import { Injectable, signal } from '@angular/core';

/** Fine pointer with hover gets a visible menu. Touch uses swipe. */
export const DESKTOP_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

export function isDesktopPointer(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(DESKTOP_POINTER_QUERY).matches;
}

@Injectable({ providedIn: 'root' })
export class PointerModeService {
  readonly isDesktop = signal(isDesktopPointer());

  constructor() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const query = window.matchMedia(DESKTOP_POINTER_QUERY);
    query.addEventListener('change', () => {
      this.isDesktop.set(query.matches);
    });
  }
}
