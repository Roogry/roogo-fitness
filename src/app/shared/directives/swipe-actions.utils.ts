import {
  AXIS_LOCK_PX,
  FLICK_VELOCITY_PX_PER_MS,
  RUBBER_BAND_CONSTANT,
  SNAP_OPEN_RATIO,
  SWIPE_IGNORE_SELECTOR,
} from './swipe-actions.constants';
import type { SwipeAxis } from './swipe-actions.types';

/**
 * Locks the gesture once movement clears the axis threshold.
 * A vertical move wins ties so the page scroll, not the card, takes the gesture.
 */
export function nextSwipeAxis(dx: number, dy: number): SwipeAxis {
  if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return 'pending';
  if (Math.abs(dx) > Math.abs(dy)) return 'horizontal';
  return 'vertical';
}

/**
 * Follows the finger between closed and fully open.
 * Past either end the card resists, the way iOS Mail does, instead of tracking 1:1.
 */
export function rubberBandOffset(rawPx: number, actionWidthPx: number): number {
  if (actionWidthPx <= 0) return 0;
  if (rawPx < -actionWidthPx) {
    const extra = -rawPx - actionWidthPx;
    return -actionWidthPx - rubberBandPast(extra, actionWidthPx);
  }
  if (rawPx > 0) return rubberBandPast(rawPx, actionWidthPx);
  return rawPx;
}

export function shouldSnapSwipeOpen(
  offsetPx: number,
  actionWidthPx: number,
  velocityXPxPerMs: number,
): boolean {
  if (actionWidthPx <= 0) return false;
  if (velocityXPxPerMs <= -FLICK_VELOCITY_PX_PER_MS && offsetPx < 0) return true;
  if (velocityXPxPerMs >= FLICK_VELOCITY_PX_PER_MS) return false;
  return offsetPx <= -actionWidthPx * SNAP_OPEN_RATIO;
}

function rubberBandPast(overscrollPx: number, dimensionPx: number): number {
  if (overscrollPx <= 0 || dimensionPx <= 0) return 0;
  const resisted =
    (1 - 1 / ((overscrollPx * RUBBER_BAND_CONSTANT) / dimensionPx + 1)) * dimensionPx;
  return resisted;
}

export function isSwipeIgnoredTarget(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest(SWIPE_IGNORE_SELECTOR);
}
