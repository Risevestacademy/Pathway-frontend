/** Columns in the activity grid: a year of weeks. */
export const ACTIVITY_WEEKS = 53;
export const ACTIVITY_DAYS_PER_WEEK = 7;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The last twelve months, oldest first, ending with the month of `today`. */
export function buildMonthLabels(today: Date): string[] {
  return Array.from({ length: 12 }, (_, index) => MONTHS[(today.getMonth() + 1 + index) % 12]);
}
