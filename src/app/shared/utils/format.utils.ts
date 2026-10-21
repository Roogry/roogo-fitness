import { Range } from '../models';

export function formatRange(range?: Range): string | null {
  if (!range) return null;
  if (range.min === range.max) {
    return `${range.min}`;
  }
  return `${range.min} - ${range.max}`;
}
