import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats a duration in seconds into a human-readable string (hours, minutes, seconds).
 * @example
 * <!-- returns '01:05m' -->
 * {{ 3930 | timeFormat }}
 */
@Pipe({
  name: 'timeFormat',
})
export class timeFormatPipe implements PipeTransform {
  /**
   * Transforms seconds into a formatted duration string.
   * @param value The duration in seconds.
   * @param args Additional arguments (unused).
   * @returns A formatted string like '01:05m', '05:30s', or '30s'.
   * @example
   * new timeFormatPipe().transform(3930); // '01:05m'
   */
  transform(value: number, ...args: unknown[]): unknown {
    if (isNaN(value) || value < 0) return '';

    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;

    if (hours > 0) return `${hours}:${minutes}m`;
    if (minutes > 0) return `${minutes}:${seconds}s`;
    return `${seconds}s`;
  }
}
