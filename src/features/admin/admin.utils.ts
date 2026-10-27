import type { ApiCareerDetail } from "../careerDetail/career.types";
import type { CareerListItem } from "../catalog/catalog.types";

/** Backend roles allowed into /admin. USER (a learner) is the only one left out. */
const ADMIN_ROLES = new Set(["ADMIN", "EDITOR", "REVIEWER", "PUBLISHER"]);

export function isAdminRole(role: string | undefined | null): boolean {
  return role ? ADMIN_ROLES.has(role.toUpperCase()) : false;
}

export type AdminStatus = "published" | "draft" | "retired";
export type StatusFilter = "all" | AdminStatus;

export const STATUS_LABEL: Record<AdminStatus, string> = {
  published: "Published",
  draft: "Draft",
  retired: "Retired",
};

const STATUS_FROM_API: Record<ApiCareerDetail["status"], AdminStatus> = {
  PUBLISHED: "published",
  DRAFT: "draft",
  RETIRED: "retired",
};

export type SourceHealth = "ok" | "stale" | "missing";

export interface AdminCareerRow {
  id: string;
  title: string;
  shortDescription: string;
  status: AdminStatus;
  stepCount: number | null;
  sources: { health: SourceHealth; label: string } | null;
  updatedAt: string | null;
  /** Created in the browser only; has no page on the public site. */
  isLocal?: boolean;
}

const STALE_AFTER_MONTHS = 12;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function isStale(updatedAt: string, now: Date): boolean {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - STALE_AFTER_MONTHS);
  return new Date(updatedAt) < cutoff;
}

export function getSourceHealth(
  outlook: ApiCareerDetail["outlook"],
  now = new Date(),
): { health: SourceHealth; label: string } {
  if (outlook.length === 0) return { health: "missing", label: "Missing outlook" };
  const stale = outlook.filter((o) => isStale(o.updatedAt, now)).length;
  return stale > 0
    ? { health: "stale", label: `${stale} stale` }
    : { health: "ok", label: "Up to date" };
}

/** Combines a catalogue entry with its detail (when loaded) into a table row. */
export function toAdminRow(
  item: CareerListItem,
  detail: ApiCareerDetail | undefined,
  now = new Date(),
): AdminCareerRow {
  return {
    id: item.id,
    title: item.title,
    shortDescription: item.shortDescription,
    // GET /careers only returns published careers.
    status: detail ? STATUS_FROM_API[detail.status] : "published",
    stepCount: detail ? (detail.pathway?.stepCount ?? 0) : null,
    sources: detail ? getSourceHealth(detail.outlook, now) : null,
    updatedAt: detail?.updatedAt ?? null,
  };
}

/** Reasons a career can't be published yet; empty means it's ready. */
export function getPublishIssues(row: AdminCareerRow): string[] {
  const issues: string[] = [];
  if (!row.shortDescription.trim()) issues.push("Add a one-line summary");
  if (row.sources?.health === "missing") issues.push("Add outlook and salary sources");
  if (row.sources?.health === "stale") issues.push("Refresh sources older than 12 months");
  if (!row.stepCount) issues.push("Add roadmap topics");
  return issues;
}

export function countUpdatedThisWeek(rows: AdminCareerRow[], now = new Date()) {
  return rows.filter(
    (r) => r.updatedAt && now.getTime() - new Date(r.updatedAt).getTime() < WEEK_MS,
  ).length;
}

export function countByStatus(rows: AdminCareerRow[]): Record<StatusFilter, number> {
  const counts: Record<StatusFilter, number> = {
    all: rows.length,
    published: 0,
    draft: 0,
    retired: 0,
  };
  for (const r of rows) counts[r.status] += 1;
  return counts;
}

export function filterRows(
  rows: AdminCareerRow[],
  status: StatusFilter,
  query: string,
): AdminCareerRow[] {
  const q = query.trim().toLowerCase();
  return rows.filter(
    (r) =>
      (status === "all" || r.status === status) &&
      (!q || r.title.toLowerCase().includes(q)),
  );
}

export const PAGE_SIZE = 6;

export function paginate<T>(items: T[], page: number, size = PAGE_SIZE) {
  const pageCount = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, page), pageCount);
  return {
    page: current,
    pageCount,
    items: items.slice((current - 1) * size, current * size),
  };
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}
