/**
 * Date Utility Functions
 * Standardized date handling for the portfolio
 *
 * Format: Month Year (e.g., "June 2024")
 * Storage: ISO String (e.g., "2024-06-01T00:00:00.000Z")
 */

/**
 * Format ISO date string to "Month Year" format
 * @param isoString - ISO date string
 * @returns Formatted date string (e.g., "June 2024")
 */
export function formatMonthYear(isoString: string): string {
  if (!isoString) return "";

  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

/**
 * Format ISO date string to just the year
 * @param isoString - ISO date string
 * @returns Year as string (e.g., "2024")
 */
export function formatYear(isoString: string): string {
  if (!isoString) return "";

  try {
    const date = new Date(isoString);
    return date.getFullYear().toString();
  } catch (error) {
    console.error("Error formatting year:", error);
    return "";
  }
}

/**
 * Convert YYYY-MM format to ISO string
 * @param monthString - Month string in YYYY-MM format (e.g., "2024-06")
 * @returns ISO date string
 */
export function monthToISO(monthString: string): string {
  if (!monthString) return new Date().toISOString();

  try {
    // Add day component to make valid date
    const dateStr = `${monthString}-01`;
    return new Date(dateStr).toISOString();
  } catch (error) {
    console.error("Error converting month to ISO:", error);
    return new Date().toISOString();
  }
}

/**
 * Convert ISO string to YYYY-MM format for month input
 * @param isoString - ISO date string
 * @returns Month string in YYYY-MM format (e.g., "2024-06")
 */
export function isoToMonth(isoString: string): string {
  if (!isoString) return "";

  try {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  } catch (error) {
    console.error("Error converting ISO to month:", error);
    return "";
  }
}

/**
 * Sort array of items by date (latest first)
 * @param items - Array of items with date property
 * @param dateKey - Key to access date property
 * @returns Sorted array
 */
export function sortByDateDesc<T>(items: T[], dateKey: keyof T): T[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(String(a[dateKey]));
    const dateB = new Date(String(b[dateKey]));
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Check if a date string is valid
 * @param dateString - Date string to validate
 * @returns True if valid, false otherwise
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString) return false;

  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}

/**
 * Get current date in YYYY-MM format
 * @returns Current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Parse duration string (e.g., "Jan 2023 - Present") to sort by start date
 * @param durationString - Duration string
 * @returns Date object of start date
 */
export function parseDurationStart(durationString: string): Date {
  if (!durationString) return new Date(0);

  try {
    // Extract start date (before the dash)
    const startStr = durationString.split("-")[0].trim();
    return new Date(startStr);
  } catch {
    return new Date(0);
  }
}
