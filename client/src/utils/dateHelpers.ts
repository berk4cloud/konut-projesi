/**
 * Date utility functions to avoid UTC timezone conversion bugs
 * 
 * These helpers ensure dates are handled in the local timezone
 * instead of being converted to UTC, which can cause off-by-one errors
 * for users in timezones ahead of UTC.
 */

/**
 * Convert a Date object to YYYY-MM-DD string using local timezone
 * @param date - Date object to convert
 * @returns YYYY-MM-DD formatted string
 */
export function dateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string to a Date object at local midnight
 * @param dateString - YYYY-MM-DD formatted string
 * @returns Date object set to local midnight
 */
export function stringToDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get today's date as YYYY-MM-DD string in local timezone
 * @returns Today's date in YYYY-MM-DD format
 */
export function getTodayString(): string {
  return dateToString(new Date());
}
