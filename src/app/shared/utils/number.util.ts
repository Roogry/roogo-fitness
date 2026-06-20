/**
 * Restricts a number to be within a specified range.
 * @param value The number to clamp.
 * @param [min, max] A tuple containing the minimum and maximum allowed values.
 * @returns The clamped number within the specified range.
 * @example
 * clamp(15, [0, 10]); // returns 10
 */
function clamp(value: number, [min, max]: [number, number]): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Rounds a number to the nearest step size, starting from a minimum value.
 * @param value The number to round.
 * @param min The starting minimum value.
 * @param step The step size to round to.
 * @returns The rounded number aligned with the step size.
 * @example
 * roundToStep(12.3, 0, 0.5); // returns 12.5
 */
function roundToStep(value: number, min: number, step: number): number {
  return Math.round((value - min) / step) * step + min;
}

/**
 * Converts a number within a range into a percentage (0 to 100).
 * @param value The number to convert.
 * @param min The minimum value of the range.
 * @param max The maximum value of the range.
 * @returns The percentage representation of the value within the range.
 * @example
 * convertValueToPercentage(50, 0, 200); // returns 25
 */
function convertValueToPercentage(value: number, min: number, max: number): number {
  return ((value - min) / (max - min)) * 100;
}

export { clamp, roundToStep, convertValueToPercentage };
