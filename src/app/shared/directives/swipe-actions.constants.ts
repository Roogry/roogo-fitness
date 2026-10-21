/** Travel before the gesture commits to horizontal or vertical. */
export const AXIS_LOCK_PX = 10;

/** Past this fraction of the actions, a release stays open. */
export const SNAP_OPEN_RATIO = 0.5;

/** A quick flick wins over the halfway rule. Pixels per millisecond. */
export const FLICK_VELOCITY_PX_PER_MS = 0.5;

export const RUBBER_BAND_CONSTANT = 0.55;

export const SWIPE_IGNORE_SELECTOR =
  'input, textarea, select, button, [cdkDragHandle], [data-drag-handle]';
