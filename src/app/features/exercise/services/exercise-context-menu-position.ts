/** Gap between the lifted card and the menu. Kept in the top coordinate, not in a keyframe. */
export const MENU_GAP_PX = 8;
/** Side inset so a wide menu stays on screen. */
export const MENU_EDGE_MARGIN_PX = 8;

export interface VisualViewportOffset {
  offsetTop: number;
  offsetLeft: number;
  width: number;
  height: number;
}

export interface ContextMenuPlacement {
  top: number;
  left: number;
  placedAbove: boolean;
}

/**
 * `getBoundingClientRect` is visual-viewport space. `position: fixed` on iOS is
 * layout-viewport space, which starts `offsetTop` above the visual viewport when
 * the URL bar is collapsed. Adding that offset lands the fixed box on the card.
 */
export function fixedOriginFromVisualRect(
  visual: { top: number; left: number },
  offset: { offsetTop: number; offsetLeft: number },
): { top: number; left: number } {
  return {
    top: visual.top + offset.offsetTop,
    left: visual.left + offset.offsetLeft,
  };
}

export function visualViewportOffset(
  viewport: { offsetTop?: number; offsetLeft?: number; width?: number; height?: number } | null,
  fallback: { width: number; height: number },
): VisualViewportOffset {
  return {
    offsetTop: viewport?.offsetTop ?? 0,
    offsetLeft: viewport?.offsetLeft ?? 0,
    width: viewport?.width ?? fallback.width,
    height: viewport?.height ?? fallback.height,
  };
}

/**
 * Below the card, or above it when the session bar and keyboard leave no room.
 * Coordinates stay in visual-viewport space; the caller converts them for `position: fixed`.
 */
export function placeContextMenu(input: {
  cardTop: number;
  cardLeft: number;
  cardWidth: number;
  cardHeight: number;
  menuWidth: number;
  menuHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  bottomClearance: number;
}): ContextMenuPlacement {
  const belowTop = input.cardTop + input.cardHeight + MENU_GAP_PX;
  const spaceBelow = input.viewportHeight - input.bottomClearance - belowTop;
  const placedAbove = input.menuHeight > spaceBelow;
  const top = placedAbove ? input.cardTop - MENU_GAP_PX - input.menuHeight : belowTop;
  const centered = input.cardLeft + (input.cardWidth - input.menuWidth) / 2;
  const maxLeft = input.viewportWidth - MENU_EDGE_MARGIN_PX - input.menuWidth;
  return {
    top,
    left: clamp(centered, MENU_EDGE_MARGIN_PX, Math.max(MENU_EDGE_MARGIN_PX, maxLeft)),
    placedAbove,
  };
}

/** The menu's edge that touches the card is the scale origin. `bottom` means the menu flipped above. */
export function menuSpringOrigin(overlayY: string): 'menu-origin-top' | 'menu-origin-bottom' {
  return overlayY === 'bottom' ? 'menu-origin-bottom' : 'menu-origin-top';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
