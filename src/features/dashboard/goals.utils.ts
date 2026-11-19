import type { DashboardDayDto } from "../../lib/api/dashboard.api";
import { parseIsoDate } from "./activity.utils";

export interface WeekDay {
  label: string;
  isToday: boolean;
  /** The person did something that day. */
  active: boolean;
}

const WEEK_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

/** getDay() has Sunday as 0, so shift it to put Monday first. */
function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** Monday to Sunday, with the given day marked as today and no day active. */
export function buildWeek(today: Date): WeekDay[] {
  const todayIndex = weekdayIndex(today);
  return WEEK_LABELS.map((label, index) => ({
    label,
    isToday: index === todayIndex,
    active: false,
  }));
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

/**
 * The week strip from the backend's days, in the order it sends them. Without any days
 * (nothing to show yet) it falls back to an empty Monday-to-Sunday week.
 */
export function buildWeekStrip(days: DashboardDayDto[], today: Date): WeekDay[] {
  if (days.length === 0) return buildWeek(today);

  return days.flatMap((day) => {
    const date = parseIsoDate(day.date);
    if (!date) return [];
    return [{ label: WEEK_LABELS[weekdayIndex(date)], isToday: isSameDay(date, today), active: day.active }];
  });
}
