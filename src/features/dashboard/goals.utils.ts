import type { DashboardSummary } from "./dashboard.utils";

export interface Goal {
  id: "explore" | "build" | "compare";
  title: string;
  done: boolean;
}

export interface WeekDay {
  label: string;
  isToday: boolean;
}

const WEEK_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

/**
 * The first-steps checklist. The backend doesn't track goals, so only the one
 * we can tell from real data is ever ticked: having built a pathway.
 */
export function buildTodaysGoals(summary: DashboardSummary): Goal[] {
  return [
    { id: "explore", title: "Explore a career that interests you", done: false },
    { id: "build", title: "Build your first pathway", done: summary.pathwaysCount > 0 },
    { id: "compare", title: "Save a career to compare", done: false },
  ];
}

/** Monday to Sunday, with the given day marked as today. */
export function buildWeek(today: Date): WeekDay[] {
  const todayIndex = (today.getDay() + 6) % 7; // getDay() has Sunday as 0
  return WEEK_LABELS.map((label, index) => ({ label, isToday: index === todayIndex }));
}
