import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type { ClassValue };

/**
 * Merges multiple Tailwind CSS classes dynamically using clsx and tailwind-merge.
 * @param inputs An array of class values to be merged.
 * @returns A single merged string of CSS classes.
 * @example
 * mergeClasses('text-red-500', ['bg-blue-500', 'p-4'], { 'hidden': false });
 * // returns 'text-red-500 bg-blue-500 p-4'
 */
export function mergeClasses(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * A no-operation function that does nothing.
 * @returns undefined
 * @example
 * const callback = noopFn;
 */
export const noopFn = () => void 0;

/**
 * Checks if the text content inside an HTML element is truncated (overflowing).
 * @param element The DOM element to check.
 * @returns True if the element's content exceeds its visible width, false otherwise.
 * @example
 * const isTruncated = isElementContentTruncated(myDivElement);
 */
export const isElementContentTruncated = (element: HTMLElement | undefined): boolean => {
  if (!element) {
    return false;
  }
  const range = document.createRange();
  range.selectNodeContents(element);
  const rangeWidth = range.getBoundingClientRect().width;
  const elementWidth = element.getBoundingClientRect().width;

  return rangeWidth > elementWidth;
};
