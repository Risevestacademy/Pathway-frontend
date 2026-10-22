import type { ApiCareerDetail } from "../careerDetail/career.types";
import type { CareerPathwayDto } from "../../lib/api/pathways.api";
import type { AdminCareerRow } from "./admin.utils";

export type Importance = "required" | "nice";

export interface CareerDetailsForm {
  name: string;
  summary: string;
  whoItSuits: string;
  category: string;
  /** Free text, e.g. "₦250,000 - ₦450,000". */
  salary: string;
  salarySource: string;
  demandOutlook: string;
}

export interface SkillItem {
  id: string;
  name: string;
  description: string;
  importance: Importance;
  /** Roadmap topics that teach this skill. */
  topicIds: string[];
  source: string;
  updatedAt: string | null;
}

export interface RoadmapTopic {
  id: string;
  title: string;
  /** The skill this topic teaches. */
  skillId: string | null;
}

export interface RoadmapStage {
  id: string;
  title: string;
  topics: RoadmapTopic[];
}

export type ResourceType =
  | "course"
  | "video"
  | "article"
  | "documentation"
  | "book"
  | "certification";
export type ResourceCost = "free" | "paid" | "unknown";
export type LinkStatus = "working" | "broken" | "not-checked";

export interface ResourceItem {
  id: string;
  title: string;
  url: string;
  description: string;
  type: ResourceType;
  cost: ResourceCost;
  topicIds: string[];
  linkStatus: LinkStatus;
  lastChecked: string | null;
}

export interface SourceItem {
  id: string;
  title: string;
  /** Empty means the source can't be checked by learners yet. */
  link: string;
  usedFor: string;
  type: string;
  lastChecked: string | null;
}

export interface EditableCareer {
  details: CareerDetailsForm;
  skills: SkillItem[];
  stages: RoadmapStage[];
  resources: ResourceItem[];
  sources: SourceItem[];
}

export interface CareerDraft extends EditableCareer {
  savedAt: string;
  submittedAt?: string;
}

export const RESOURCE_TYPE_LABEL: Record<ResourceType, string> = {
  course: "Course",
  video: "Video",
  article: "Article",
  documentation: "Documentation",
  book: "Book",
  certification: "Certification",
};

export const COST_LABEL: Record<ResourceCost, string> = {
  free: "Free",
  paid: "Paid",
  unknown: "Unknown",
};

export const LINK_STATUS_LABEL: Record<LinkStatus, string> = {
  working: "Working",
  broken: "Broken",
  "not-checked": "Not checked",
};

export const SOURCE_USED_FOR = [
  "Salary range",
  "Skills and topics",
  "Skills and demand outlook",
  "Roadmap order",
  "Demand outlook",
];

export const SOURCE_TYPES = [
  "Salary survey",
  "Documentation",
  "Job posts",
  "Community guide",
  "Report",
];

export function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

const LEVEL_LABEL: Record<string, string> = {
  STUDENT: "University student",
  RECENT_GRAD: "Recent graduate",
  EARLY_CAREER: "Early career professional",
};

const RESOURCE_TYPE_FROM_API: Record<string, ResourceType> = {
  COURSE: "course",
  CERTIFICATION: "certification",
  ARTICLE: "article",
  VIDEO: "video",
  BOOK: "book",
};

const COST_FROM_API: Record<string, ResourceCost> = {
  FREE: "free",
  PAID: "paid",
  UNKNOWN: "unknown",
};

function formatSalary(outlook: ApiCareerDetail["outlook"]): string {
  const o = outlook.find((x) => x.median || x.percentile25 || x.percentile75);
  if (!o) return "";
  const cur = o.currency ? `${o.currency} ` : "";
  if (o.percentile25 && o.percentile75) return `${cur}${o.percentile25} - ${o.percentile75}`;
  return `${cur}${o.median ?? ""}`.trim();
}

function seedSources(outlook: ApiCareerDetail["outlook"]): SourceItem[] {
  const seen = new Set<string>();
  const sources: SourceItem[] = [];
  for (const o of outlook) {
    if (seen.has(o.source)) continue;
    seen.add(o.source);
    sources.push({
      id: o.id,
      title: o.source,
      link: o.sourceUrl ?? "",
      usedFor: o.demandLevel ? "Demand outlook" : "Salary range",
      type: o.demandLevel ? "Report" : "Salary survey",
      lastChecked: o.updatedAt,
    });
  }
  return sources;
}

type Pathway = CareerPathwayDto["pathway"] | null | undefined;

/** Starting point for the editor, built from the public career and pathway APIs. */
export function seedFromDetail(detail: ApiCareerDetail, pathway?: Pathway): EditableCareer {
  const steps = [...(pathway?.steps ?? [])].sort((a, b) => a.order - b.order);
  const salaryOutlook = detail.outlook.find((x) => x.median || x.percentile25 || x.percentile75);

  const resources = new Map<string, ResourceItem>();
  for (const step of steps) {
    for (const r of step.resources) {
      const existing = resources.get(r.id);
      if (existing) {
        existing.topicIds.push(step.id);
        continue;
      }
      resources.set(r.id, {
        id: r.id,
        title: r.title,
        url: r.url,
        description: r.description ?? "",
        type: RESOURCE_TYPE_FROM_API[r.type] ?? "article",
        cost: COST_FROM_API[r.costStatus] ?? "unknown",
        topicIds: [step.id],
        // The API only says when a link was last checked, not whether it passed.
        linkStatus: r.lastCheckedDate ? "working" : "not-checked",
        lastChecked: r.lastCheckedDate ?? null,
      });
    }
  }

  return {
    details: {
      name: detail.title,
      summary: detail.description,
      whoItSuits: detail.targetLevels.map((l) => LEVEL_LABEL[l] ?? l).join(", "),
      category: detail.field.name,
      salary: formatSalary(detail.outlook),
      salarySource: salaryOutlook
        ? [salaryOutlook.source, salaryOutlook.sourceUrl].filter(Boolean).join(" · ")
        : "",
      demandOutlook: detail.outlook.find((x) => x.demandLevel)?.demandLevel ?? "",
    },
    // The API doesn't expose importance or per-skill sources yet.
    skills: detail.skills.map((s) => ({
      id: s.id,
      name: s.name,
      description: "",
      importance: "required",
      topicIds: steps.filter((st) => st.skills.some((k) => k.id === s.id)).map((st) => st.id),
      source: "",
      updatedAt: detail.updatedAt,
    })),
    // The API has no stages, so every topic starts in one stage.
    stages: steps.length
      ? [
          {
            id: "stage-1",
            title: "Roadmap",
            topics: steps.map((st) => ({
              id: st.id,
              title: st.title,
              skillId: st.skills[0]?.id ?? null,
            })),
          },
        ]
      : [],
    resources: [...resources.values()],
    sources: seedSources(detail.outlook),
  };
}

/** Starting point for careers created locally. */
export function seedFromRow(row: AdminCareerRow): EditableCareer {
  return {
    details: {
      name: row.title,
      summary: row.shortDescription,
      whoItSuits: "",
      category: "",
      salary: "",
      salarySource: "",
      demandOutlook: "",
    },
    skills: [],
    stages: [],
    resources: [],
    sources: [],
  };
}

/** Fills sections that older saved drafts don't have. */
export function normalizeDraft(d: Partial<EditableCareer> & Pick<EditableCareer, "details">): EditableCareer {
  return {
    details: d.details,
    skills: (d.skills ?? []).map((s) => ({ ...s, topicIds: s.topicIds ?? [] })),
    stages: d.stages ?? [],
    resources: d.resources ?? [],
    sources: d.sources ?? [],
  };
}

export type DetailsErrors = Partial<Record<keyof CareerDetailsForm, string>>;

const NAME_MAX = 80;
const SUMMARY_MIN = 10;
const SUMMARY_MAX = 200;

/** Every field is required; a career isn't ready to submit until this is empty. */
export function validateDetails(d: CareerDetailsForm): DetailsErrors {
  const errors: DetailsErrors = {};
  const name = d.name.trim();
  const summary = d.summary.trim();

  if (!name) errors.name = "Every career needs a name. Required.";
  else if (name.length < 2) errors.name = "Use at least 2 characters.";
  else if (name.length > NAME_MAX) errors.name = `Keep the name under ${NAME_MAX} characters.`;

  if (!summary) errors.summary = "Learners see this on the Explore card. Required.";
  else if (summary.length < SUMMARY_MIN) {
    errors.summary = `Write at least ${SUMMARY_MIN} characters so learners get the point.`;
  } else if (summary.length > SUMMARY_MAX) {
    errors.summary = `Keep the summary under ${SUMMARY_MAX} characters.`;
  }

  if (!d.whoItSuits.trim()) errors.whoItSuits = "Say who this career suits. Required.";
  if (!d.category.trim()) errors.category = "Choose a category. Required.";

  if (!d.salary.trim()) errors.salary = "Add the typical starting salary. Required.";
  else if (!/\d/.test(d.salary)) errors.salary = "Enter the salary as a number or range.";

  if (!d.salarySource.trim()) {
    errors.salarySource = d.salary.trim()
      ? "A figure without a source can’t be published."
      : "Add the source for this figure. Required.";
  }

  if (!d.demandOutlook.trim()) errors.demandOutlook = "Add the demand outlook. Required.";
  return errors;
}

const ERROR_FIX_LABEL: Record<keyof DetailsErrors, string> = {
  name: "the career name",
  summary: "the one-line summary",
  whoItSuits: "who it suits",
  category: "the category",
  salary: "the salary",
  salarySource: "the salary source",
  demandOutlook: "the demand outlook",
};

export function describeFixes(errors: DetailsErrors): string {
  const labels = (Object.keys(errors) as (keyof DetailsErrors)[]).map(
    (k) => ERROR_FIX_LABEL[k],
  );
  if (labels.length <= 1) return `Add ${labels[0] ?? "the missing details"}`;
  return `Add ${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

/** Problems outside the Details tab that also block submitting. */
export function getOtherBlockers(career: EditableCareer): string[] {
  const blockers: string[] = [];
  const noSource = career.skills.filter((s) => !s.source.trim()).length;
  if (noSource > 0) {
    blockers.push(`${noSource} skill${noSource > 1 ? "s need" : " needs"} a source`);
  }
  for (const s of career.sources.filter((x) => !x.link.trim())) {
    blockers.push(`“${s.title}” has no link`);
  }
  return blockers;
}

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

export function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
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
