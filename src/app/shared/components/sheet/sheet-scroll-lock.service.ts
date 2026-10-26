import { Injectable, inject } from '@angular/core';
import { OverlayContainer, ScrollStrategyOptions } from '@angular/cdk/overlay';

/**
 * Pins the page while any sheet is open, using CDK's block scroll strategy.
 *
 * That strategy is the iOS lock: `cdk-global-scrollblock` sets `position: fixed` on the
 * document element, and `window.scroll` restores the offset when the lock ends. CDK treats
 * a second enable as a no-op and disable always unlocks, so a counter keeps the page pinned
 * while sheets are stacked. The strategy's CSS is not in the global stylesheet; touching
 * the overlay container loads it.
 */
@Injectable({ providedIn: 'root' })
export class SheetScrollLockService {
  private readonly overlayContainer = inject(OverlayContainer);
  private readonly strategy = inject(ScrollStrategyOptions).block();
  private openSheets = 0;

  constructor() {
    this.overlayContainer.getContainerElement();
  }

  lock(): void {
    this.openSheets += 1;
    if (this.openSheets === 1) this.strategy.enable();
  }

  unlock(): void {
    if (this.openSheets === 0) return;
    this.openSheets -= 1;
    if (this.openSheets === 0) this.strategy.disable();
  }
}
