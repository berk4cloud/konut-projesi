import { DateTime } from 'luxon';

/**
 * Validate IANA timezone string
 * @param timezone IANA timezone string (e.g., "Europe/Amsterdam", "America/New_York")
 * @returns true if timezone is valid, false otherwise
 */
export function isValidTimezone(timezone: string): boolean {
  return DateTime.now().setZone(timezone).isValid;
}

/**
 * Get today's date in YYYY-MM-DD format for a given timezone
 * @param timezone IANA timezone string (e.g., "Europe/Amsterdam", "America/New_York")
 * @returns Today's date string in YYYY-MM-DD format (falls back to UTC if timezone is invalid)
 */
export function getTodayInTimezone(timezone: string): string {
  const today = DateTime.now().setZone(timezone).toISODate();
  if (!today) {
    // Fallback to UTC if timezone is invalid
    console.warn(`Invalid timezone "${timezone}", falling back to UTC`);
    return DateTime.now().setZone('UTC').toISODate() || '';
  }
  return today;
}
