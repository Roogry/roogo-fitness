/**
 * Pixels the keyboard covers at the bottom of the layout viewport.
 *
 * The usual case is the gap under the visual viewport. The first time the iOS keyboard opens,
 * Safari often pans the page instead: `offsetTop` grows by about the keyboard height, that gap
 * is 0, and a sheet pinned to the layout bottom stays under the keyboard. The shrink of the
 * visual viewport is the inset in that case. A later open reports the same pixels as a gap.
 */
export function computeKeyboardOffset(
  layoutHeight: number,
  viewport: { height: number; offsetTop: number },
): number {
  const bottomGap = layoutHeight - (viewport.height + viewport.offsetTop);
  if (bottomGap > 0) return Math.max(0, Math.round(bottomGap));
  if (viewport.offsetTop <= 0) return 0;
  return Math.max(0, Math.round(layoutHeight - viewport.height));
}
