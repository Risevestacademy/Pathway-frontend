/** Request and response shapes for PUT /admin/careers/{careerId}/revision. */

export const REVISION_SCHEMA_VERSION = 1;

export type RevisionStatus = "DRAFT" | "IN_REVIEW";

export interface RevisionCareer {
  title: string;
  slug: string;
  description: string;
  roleSummary: string;
  fieldId: string;
  /** e.g. "STUDENT". */
  targetLevels: string[];
  exampleActivities: string[];
  typicalEducationNote: string;
  certificationsNote: string;
}

export interface RevisionPathway {
  title: string;
  description: string;
}

export interface RevisionStep {
  /** An existing step's id, or a placeholder such as "new-1" for one that is new. */
  id: string;
  order: number;
  title: string;
  description: string;
  learningObjective: string;
  prerequisites: string;
  expectedActivity: string;
  skillIds: string[];
  resourceIds: string[];
}

export interface RevisionSkill {
  skillId: string;
  /** e.g. "REQUIRED". */
  importance: string;
}

export interface RevisionOutlook {
  id: string;
  /** e.g. "SALARY". */
  type: string;
  geography: string;
  period: string;
  sourceId: string;
  /** Money and percentages are decimal strings, e.g. "65000.00". */
  median?: string;
  percentile25?: string;
  percentile75?: string;
  currency?: string;
  payPeriod?: string;
  grossOrNet?: string;
  experienceLevel?: string;
  baseYear?: number;
  baseValue?: number;
  projectedYear?: number;
  projectedValue?: number;
  growthPercent?: string;
  /** e.g. "LOW". */
  demandLevel?: string;
}

export interface RevisionResource {
  id: string;
  title: string;
  description: string;
  url: string;
  /** e.g. "COURSE". */
  type: string;
  provider: string;
  /** e.g. "FREE". */
  costStatus: string;
  certificationCost?: string;
  curationRationale: string;
  /** YYYY-MM-DD. */
  lastCheckedDate: string;
}

/** The full proposed career. It replaces the stored revision; it is not a patch. */
export interface CareerRevisionSnapshot {
  schemaVersion: number;
  career: RevisionCareer;
  pathway: RevisionPathway;
  steps: RevisionStep[];
  skills: RevisionSkill[];
  outlook: RevisionOutlook[];
  resources: RevisionResource[];
}

export interface SavedRevision {
  id: string;
  careerId: string;
  status: RevisionStatus;
  /** The live career version this revision was started from. */
  baseVersion: number;
  /** True when this save opened a new revision rather than updating the open draft. */
  created: boolean;
  updatedAt: string;
}
