import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge conditional CSS classes and resolve conflicting Tailwind utilities.
 * @param inputs - Conditional class names and class maps.
 * @returns A merged CSS class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
