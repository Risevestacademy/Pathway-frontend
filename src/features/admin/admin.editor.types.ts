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
