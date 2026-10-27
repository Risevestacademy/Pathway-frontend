import { hasTrackIcon } from "@/components/trackIcons";
import { findSkillCheckCareerByTitle } from "@/features/skillCheck/careerMatch";
import type { TrackIconKey } from "@/features/skillCheck/skillCheck.types";
import type { CareerLevel, PayBasis, PayPeriod } from "@/types/career.types";

/** True when every whitespace-separated term in `query` appears somewhere in `fields`. */
export function matchesQuery(fields: (string | null | undefined)[], query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = fields.filter(Boolean).join(" ").toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

const toIconKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * Careers with no icon of their own borrow another track's icon until design
 * supplies one. Keyed by the career's title or slug in icon-key form.
 */
const ICON_STAND_INS: Record<string, TrackIconKey> = {
  "qa-engineer": "ux-researcher",
};

/**
 * Picks a track icon for a career title. Tries the skill-check career match
 * first (it knows aliases such as "UI/UX Designer"), then the title itself,
 * then the title with "engineer" read as "developer" (the icon set uses
 * "Frontend Developer" where the API says "Frontend Engineer"), then a
 * stand-in icon.
 */
export function careerIconKey(title: string, slug?: string): TrackIconKey | null {
  const standIn = ICON_STAND_INS[toIconKey(title)] ?? (slug ? ICON_STAND_INS[toIconKey(slug)] : undefined);
  const match = findSkillCheckCareerByTitle(title, slug);
  if (match && hasTrackIcon(match.icon)) return match.icon;

  const candidates = [title, title.replace(/engineer/gi, "developer")].map(toIconKey);
  for (const candidate of candidates) {
    if (hasTrackIcon(candidate as TrackIconKey)) return candidate as TrackIconKey;
  }
  return standIn && hasTrackIcon(standIn) ? standIn : null;
}

const AUDIENCE: Record<CareerLevel, string> = {
  "university-student": "Great for university students",
  "recent-graduate": "Great for recent graduates",
  "early-career": "Great for early-career professionals",
};

/** The hero badge: the earliest career stage the career is aimed at. */
export function audienceLabel(levels: CareerLevel[]): string | null {
  const order: CareerLevel[] = ["university-student", "recent-graduate", "early-career"];
  const first = order.find((level) => levels.includes(level));
  return first ? AUDIENCE[first] : null;
}

export const payPeriodSuffix: Record<PayPeriod, string> = {
  year: "/year",
  month: "/month",
  hour: "/hour",
};

export function payBasisLabel(basis: PayBasis): string | null {
  if (basis === "gross") return "Gross (before tax)";
  if (basis === "net") return "Net (after tax)";
  return null;
}

/** "entry-level" -> "Entry-level", "all experience levels" -> "All experience levels". */
export function experienceLabel(value: string | undefined): string | null {
  if (!value) return null;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export interface ProjectionPoint {
  year: number;
  value: number;
}

/** Reads the base and projected points from a projection series ("2023", "2033 (projected)"). */
export function projectionPoints(series: { label: string; value: number }[] | undefined): ProjectionPoint[] | null {
  if (!series || series.length < 2) return null;
  const points = series.map((point) => ({ year: Number.parseInt(point.label, 10), value: point.value }));
  if (points.some((point) => !Number.isFinite(point.year) || !Number.isFinite(point.value))) return null;
  const sorted = [...points].sort((a, b) => a.year - b.year);
  if (sorted[0].year === sorted[sorted.length - 1].year) return null;
  return sorted;
}

export interface ProjectionGeometry {
  line: string;
  area: string;
  /** One tick per year between the first and last point, with x in the same units as `width`. */
  ticks: { year: number; x: number }[];
  /** y of the horizontal gridlines. */
  grid: number[];
  first: { x: number; y: number };
  last: { x: number; y: number };
}

/**
 * Geometry for the employment projection chart. The API only gives a base and
 * a projected value, so the line runs straight between them. The value axis
 * starts a little below the lowest point so the change is visible.
 */
export function projectionGeometry(points: ProjectionPoint[], width: number, height: number, gridLines = 4): ProjectionGeometry {
  const firstYear = points[0].year;
  const lastYear = points[points.length - 1].year;
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || max || 1;
  const yMin = Math.max(0, min - span * 0.6);
  const yMax = max + span * 0.15;

  const x = (year: number) => ((year - firstYear) / (lastYear - firstYear)) * width;
  const y = (value: number) => height - ((value - yMin) / (yMax - yMin)) * height;
  const round = (n: number) => Math.round(n * 100) / 100;

  const coords = points.map((point) => ({ x: round(x(point.year)), y: round(y(point.value)) }));
  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x} ${c.y}`).join(" ");
  const area = `${line} L${coords[coords.length - 1].x} ${height} L${coords[0].x} ${height} Z`;

  const ticks = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => ({
    year: firstYear + i,
    x: round(x(firstYear + i)),
  }));
  const grid = Array.from({ length: gridLines }, (_, i) => round((height / (gridLines + 1)) * (i + 1)));

  return { line, area, ticks, grid, first: coords[0], last: coords[coords.length - 1] };
}
