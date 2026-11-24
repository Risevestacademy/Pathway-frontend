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

const ISO_DAY_LENGTH = "YYYY-MM-DD".length;

/**
 * The week strip from the backend's days, in the order it sends them. `today` is the
 * backend's own date (an ISO date, e.g. heatmap.to), not the browser's: the backend
 * builds the week in UTC, so the browser's local day can disagree around midnight.
 * Without any days (nothing to show yet) it falls back to an empty Monday-to-Sunday week.
 */
export function buildWeekStrip(days: DashboardDayDto[], today: string): WeekDay[] {
  if (days.length === 0) return buildWeek(parseIsoDate(today) ?? new Date());

  const todayDay = today.slice(0, ISO_DAY_LENGTH);
  return days.flatMap((day) => {
    const date = parseIsoDate(day.date);
    if (!date) return [];
    return [
      {
        label: WEEK_LABELS[weekdayIndex(date)],
        isToday: day.date.slice(0, ISO_DAY_LENGTH) === todayDay,
        active: day.active,
      },
    ];
  });
}
