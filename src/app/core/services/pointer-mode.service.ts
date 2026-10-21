import { Injectable, signal } from '@angular/core';
import { DESKTOP_POINTER_QUERY } from '@/core/utils/pointer-mode.constants';
import { isDesktopPointer } from '@/core/utils/pointer-mode.utils';

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
