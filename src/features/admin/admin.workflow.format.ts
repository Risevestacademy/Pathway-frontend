export const HOUR = 60 * 60 * 1000;
export const DAY = 24 * HOUR;

export function shortName(fullName: string): string {
  const [first, ...rest] = fullName.trim().split(/\s+/);
  const last = rest[rest.length - 1];
  return last ? `${first} ${last.charAt(0)}.` : first;
}

export function initials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

/** "5 hours", "1 day", "12 minutes". */
export function waitingLabel(iso: string, now = new Date()): string {
  const ms = Math.max(0, now.getTime() - new Date(iso).getTime());
  const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;
  if (ms < HOUR) return plural(Math.max(1, Math.round(ms / 60000)), "minute");
  if (ms < DAY) return plural(Math.floor(ms / HOUR), "hour");
  return plural(Math.floor(ms / DAY), "day");
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

/** "Today", "Yesterday" or a date. */
export function dayLabel(iso: string, now = new Date()): string {
  const date = new Date(iso);
  if (isSameDay(date, now)) return "Today";
  if (isSameDay(date, new Date(now.getTime() - DAY))) return "Yesterday";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function timeLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}
