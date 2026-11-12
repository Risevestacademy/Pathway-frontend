import type { SavedPathway } from "../progress/progress.types";

export function greetingFor(now = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

/** The first name to greet someone by, or null when nothing suggests one. */
export function firstNameOf(
  user: { fullName?: string; name?: string; email?: string } | null | undefined,
): string | null {
  const named = (user?.fullName ?? user?.name)?.trim().split(/\s+/)[0];
  if (named) return named;

  // "ada.lovelace@example.com" -> "Ada"
  const fromEmail = user?.email?.split("@")[0]?.split(/[._-]+/)[0];
  return fromEmail ? fromEmail.charAt(0).toUpperCase() + fromEmail.slice(1) : null;
}

/**
 * The pathway the progress card follows: the one they chose as active, else the
 * first one still running, else the first one saved.
 */
export function featuredPathway(pathways: SavedPathway[]): SavedPathway | undefined {
  return (
    pathways.find((pathway) => pathway.isActive) ??
    pathways.find((pathway) => !pathway.career.retired) ??
    pathways[0]
  );
}

/** A percentage the bar can show: whole, and never outside 0 to 100. */
export const clampPercentage = (value: number): number =>
  Math.min(100, Math.max(0, Math.round(Number.isFinite(value) ? value : 0)));

/** What the link on a pathway says, from how far along it is. */
export function continueLabel({ completed, total }: SavedPathway["progress"]): string {
  if (total > 0 && completed >= total) return "Review your roadmap";
  return completed > 0 ? "Continue your roadmap" : "Start your roadmap";
}

export const stepsLabel = ({ completed, total }: SavedPathway["progress"]): string =>
  total > 0 ? `${completed} of ${total} steps done` : "No steps yet";

export const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

/** Today's place in the week, with Monday as 0 and Sunday as 6. */
export const weekdayIndex = (now = new Date()): number => (now.getDay() + 6) % 7;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The twelve months the activity grid covers, oldest first, ending with this month. */
export function lastTwelveMonths(now = new Date()): string[] {
  return Array.from({ length: 12 }, (_, i) => MONTHS[(now.getMonth() + 1 + i) % 12]);
}

/** The pathway's skills for a tag line, e.g. "HTML • CSS • LAYOUTS". */
export const skillTags = (skills: { name: string }[]): string =>
  skills.map((skill) => skill.name.toUpperCase()).join(" • ");
