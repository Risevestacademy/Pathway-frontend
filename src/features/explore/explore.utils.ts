import type { TrackIconKey } from "@/features/skillCheck/skillCheck.types";
import type { CareerLevel, PayBasis, PayPeriod } from "@/types/career.types";

export function matchesQuery(fields: string[], query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = fields.join(" ").toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

// Keyed by API slug, which survives a title change. A slug missing here gets the neutral tile.
// TODO: use an icon key from the API once it provides one.
export const CAREER_ICONS: Readonly<Record<string, TrackIconKey>> = {
  "frontend-engineer": "frontend-developer",
  "backend-engineer": "backend-developer",
  "data-analyst": "data-analyst",
  "ui-ux-designer": "ux-designer",
  // TODO: drop the stand-in once design supplies a QA Engineer icon.
  "qa-engineer": "ux-researcher",
};

export function careerIconKey(slug: string): TrackIconKey | null {
  return CAREER_ICONS[slug] ?? null;
}

const AUDIENCE: Record<CareerLevel, string> = {
  "university-student": "Great for university students",
  "recent-graduate": "Great for recent graduates",
  "early-career": "Great for early-career professionals",
};

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

export function experienceLabel(value: string | undefined): string | null {
  if (!value) return null;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export interface ProjectionPoint {
  year: number;
  value: number;
}

// Series labels look like "2023" and "2033 (projected)".
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
  ticks: { year: number; x: number }[];
  grid: number[];
  first: { x: number; y: number };
  last: { x: number; y: number };
}

export function projectionGeometry(points: ProjectionPoint[], width: number, height: number, gridLines = 4): ProjectionGeometry {
  const firstYear = points[0].year;
  const lastYear = points[points.length - 1].year;
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || max || 1;
  // Start the axis below the lowest value so the change is visible.
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
