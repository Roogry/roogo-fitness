import type { ConnectedPosition, ViewportMargin } from '@angular/cdk/overlay';

/** Side gap for the touch menu. The large clearance stays on the bottom only. */
const SPRING_EDGE_MARGIN_PX = 8;
/** Same 8px gap as `--menu-offset`. */
const MENU_GAP_PX = 8;

/** The menu's edge that touches the card is the scale origin. `bottom` means the menu flipped above. */
export function menuSpringOrigin(overlayY: string): 'menu-origin-top' | 'menu-origin-bottom' {
  return overlayY === 'bottom' ? 'menu-origin-bottom' : 'menu-origin-top';
}

/** Gap direction that matches the overlay offset. Above the card, the menu shifts up. */
export function menuSpringShift(overlayY: string): 'menu-shift-up' | 'menu-shift-down' {
  return overlayY === 'bottom' ? 'menu-shift-up' : 'menu-shift-down';
}

/**
 * Below the card, then above it. Side fallbacks are omitted: a context menu should
 * flip vertically, not dock beside the card when the bottom is blocked.
 */
export function springMenuPositions(): ConnectedPosition[] {
  return [
    {
      originX: 'center',
      originY: 'bottom',
      overlayX: 'center',
      overlayY: 'top',
      offsetY: MENU_GAP_PX,
    },
    {
      originX: 'center',
      originY: 'top',
      overlayX: 'center',
      overlayY: 'bottom',
      offsetY: -MENU_GAP_PX,
    },
  ];
}

/**
 * `bottomClearance` is the session bar, keyboard, or other chrome under the card.
 * CDK treats a single margin as every edge, which makes a phone-width menu look
 * like it does not fit and falls through to a side position.
 */
export function springViewportMargin(bottomClearance: number): ViewportMargin {
  return {
    top: SPRING_EDGE_MARGIN_PX,
    bottom: bottomClearance,
    start: SPRING_EDGE_MARGIN_PX,
    end: SPRING_EDGE_MARGIN_PX,
  };
}
