import type { DashboardHeatmapDayDto } from "../../lib/api/dashboard.api";

/** Columns in the activity grid: a year of weeks. */
export const ACTIVITY_WEEKS = 53;
export const ACTIVITY_DAYS_PER_WEEK = 7;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The last twelve months, oldest first, ending with the month of `today`. */
export function buildMonthLabels(today: Date): string[] {
  return Array.from({ length: 12 }, (_, index) => MONTHS[(today.getMonth() + 1 + index) % 12]);
}

export type ActivityLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatmapCell {
  /** Null for the empty cells that line the first week up with its weekday. */
  date: string | null;
  count: number;
  level: ActivityLevel;
}

/** How dark a day is shaded: none, one, two, three or four, five or more. */
export function activityLevel(count: number): ActivityLevel {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

/** "2026-11-10" as that calendar day in local time, so the time zone can't shift it. */
export function parseIsoDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

const EMPTY_CELL: HeatmapCell = { date: null, count: 0, level: 0 };

/**
 * One cell per day, in the order the grid fills them (a week per column, Monday first).
 * Empty cells pad the first week so each day lands in its weekday row. With no history
 * the whole grid is empty.
 */
export function buildHeatmapCells(days: DashboardHeatmapDayDto[]): HeatmapCell[] {
  if (days.length === 0) {
    return Array.from({ length: ACTIVITY_WEEKS * ACTIVITY_DAYS_PER_WEEK }, () => EMPTY_CELL);
  }

  const first = parseIsoDate(days[0].date);
  const leading = first ? (first.getDay() + 6) % 7 : 0; // getDay() has Sunday as 0
  return [
    ...Array.from({ length: leading }, () => EMPTY_CELL),
    ...days.map((day) => ({ date: day.date, count: day.count, level: activityLevel(day.count) })),
  ];
}
