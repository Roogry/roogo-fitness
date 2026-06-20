import { Range } from '../models';

/**
 * Formats a range object into a display string.
 * @param range The range object containing min and max values.
 * @returns A formatted string or null if no range is provided.
 * @example
 * formatRange({ min: 5, max: 10 }); // '5 - 10'
 * formatRange({ min: 5, max: 5 }); // '5'
 */
export function formatRange(range?: Range): string | null {
  if (!range) return null;
  if (range.min === range.max) {
    return `${range.min}`;
  }
  return `${range.min} - ${range.max}`;
}
