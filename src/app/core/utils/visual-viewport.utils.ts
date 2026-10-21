export function computeKeyboardOffset(
  innerHeight: number,
  viewport: { height: number; offsetTop: number },
): number {
  return Math.max(0, Math.round(innerHeight - (viewport.height + viewport.offsetTop)));
}
