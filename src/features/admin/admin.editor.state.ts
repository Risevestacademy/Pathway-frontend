import { isValidUrl } from "./admin.editor.validation";
import type {
  Importance,
  LinkStatus,
  ResourceItem,
  RoadmapStage,
  SkillItem,
  SourceItem,
} from "./admin.editor.types";

export type SkillFilter = "all" | Importance | "needs-source";

export function filterSkills(skills: SkillItem[], filter: SkillFilter, query: string) {
  const q = query.trim().toLowerCase();
  return skills.filter((s) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "needs-source" ? !s.source.trim() : s.importance === filter);
    return matchesFilter && (!q || s.name.toLowerCase().includes(q));
  });
}

export function countSkills(skills: SkillItem[]): Record<SkillFilter, number> {
  return {
    all: skills.length,
    required: skills.filter((s) => s.importance === "required").length,
    nice: skills.filter((s) => s.importance === "nice").length,
    "needs-source": skills.filter((s) => !s.source.trim()).length,
  };
}

export interface TopicOption {
  id: string;
  title: string;
  stageTitle: string;
}

export function listTopics(stages: RoadmapStage[]): TopicOption[] {
  return stages.flatMap((s) =>
    s.topics.map((t) => ({ id: t.id, title: t.title, stageTitle: s.title })),
  );
}

export function countTopics(stages: RoadmapStage[]) {
  return stages.reduce((n, s) => n + s.topics.length, 0);
}

/** No network check is possible from the browser, so this only tests the link's shape. */
export function checkResourceLinks(resources: ResourceItem[], now = new Date()): ResourceItem[] {
  return resources.map((r) => ({
    ...r,
    linkStatus: isValidUrl(r.url) ? "working" : "broken",
    lastChecked: now.toISOString(),
  }));
}

export type ResourceFilter = "all" | LinkStatus;

export function filterResources(
  resources: ResourceItem[],
  filter: ResourceFilter,
  query: string,
) {
  const q = query.trim().toLowerCase();
  return resources.filter(
    (r) =>
      (filter === "all" || r.linkStatus === filter) &&
      (!q || r.title.toLowerCase().includes(q)),
  );
}

export function countResources(resources: ResourceItem[]): Record<ResourceFilter, number> {
  return {
    all: resources.length,
    working: resources.filter((r) => r.linkStatus === "working").length,
    broken: resources.filter((r) => r.linkStatus === "broken").length,
    "not-checked": resources.filter((r) => r.linkStatus === "not-checked").length,
  };
}

export type SourceStatus =
  | { kind: "ok"; label: string }
  | { kind: "review"; label: string }
  | { kind: "missing"; label: string }
  | { kind: "unchecked"; label: string };

const REVIEW_WINDOW_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Community guides change fast, so they're re-reviewed monthly; the rest yearly. */
function reviewIntervalMonths(type: string) {
  return type === "Community guide" ? 1 : 12;
}

export function getSourceStatus(source: SourceItem, now = new Date()): SourceStatus {
  if (!source.link.trim()) return { kind: "missing", label: "Missing link" };
  if (!source.lastChecked) return { kind: "unchecked", label: "Not checked" };
  const due = new Date(source.lastChecked);
  due.setMonth(due.getMonth() + reviewIntervalMonths(source.type));
  const daysLeft = Math.ceil((due.getTime() - now.getTime()) / DAY_MS);
  if (daysLeft <= 0) return { kind: "review", label: "Review overdue" };
  if (daysLeft <= REVIEW_WINDOW_DAYS) {
    return { kind: "review", label: `Review in ${daysLeft} days` };
  }
  return { kind: "ok", label: "Up to date" };
}

export function displayLink(link: string): string {
  return link.trim().replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}
