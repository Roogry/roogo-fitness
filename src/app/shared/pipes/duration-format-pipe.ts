import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats a duration in seconds into a human-readable string (hours, minutes, seconds).
 * @example
 * <!-- returns '1h 5min 30s' -->
 * {{ 3930 | durationFormat }}
 */
@Pipe({
  name: 'durationFormat',
})
export class DurationFormatPipe implements PipeTransform {
  /**
   * Transforms seconds into a formatted duration string.
   * @param value The duration in seconds.
   * @param args Additional arguments (unused).
   * @returns A formatted string like '1h 5min', '5min 30s', or '30s'.
   * @example
   * new DurationFormatPipe().transform(3930); // '1h 5min 30s'
   */
  transform(value: number, ...args: unknown[]): unknown {
    if (isNaN(value) || value < 0) return '';

    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;

    if (hours > 0) return `${hours}h ${minutes}min ${seconds}s`;
    if (minutes > 0) return `${minutes}min ${seconds}s`;
    return `${seconds}s`;
  }
}
