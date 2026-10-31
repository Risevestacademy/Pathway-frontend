/** Request and response shapes for POST /admin/careers. */

export interface CreateCareerInput {
  title: string;
  /** Unique, ignoring case. */
  slug: string;
  fieldId: string;
  description: string;
  roleSummary: string;
  /** e.g. "RECENT_GRAD", "EARLY_CAREER". */
  targetLevels: string[];
}

export interface CreatedCareer {
  id: string;
  slug: string;
  title: string;
  description: string;
  roleSummary: string | null;
  fieldId: string;
  targetLevels: string[];
  status: string;
  version: number;
  createdAt: string;
  /** The first draft revision, created in the same write. */
  revision: {
    id: string;
    status: string;
    baseVersion: number;
  };
}

/** "DevOps Engineer" -> "devops-engineer". */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The audiences a career can target, as the API names them. */
export const TARGET_LEVEL_OPTIONS = [
  { value: "STUDENT", label: "University student" },
  { value: "RECENT_GRAD", label: "Recent graduate" },
  { value: "EARLY_CAREER", label: "Early career professional" },
] as const;

export type AdminApiStatus = "DRAFT" | "PUBLISHED" | "RETIRED";

/** One row of GET /admin/careers: a career in any status, most recently updated first. */
export interface AdminCareerListItem {
  id: string;
  slug: string;
  title: string;
  status: AdminApiStatus;
  version: number;
  updatedAt: string;
  field?: { name: string; slug: string };
}

export interface AdminCareerPage {
  items: AdminCareerListItem[];
  total: number;
  page: number;
  limit: number;
}

/** GET /admin/careers/{id}: the career with its skills, outlook and pathway steps. */
export interface AdminCareerDetailResponse {
  id: string;
  slug: string;
  title: string;
  description: string;
  roleSummary: string | null;
  exampleActivities: string[];
  typicalEducationNote: string | null;
  certificationsNote: string | null;
  targetLevels: ("STUDENT" | "RECENT_GRAD" | "EARLY_CAREER")[];
  status: AdminApiStatus;
  version: number;
  publishedAt: string | null;
  updatedAt: string;
  field: { id: string; name: string; slug: string };
  skills: { id: string; name: string; importance: string }[];
  outlook: {
    id: string;
    type: string;
    geography: string;
    period: string;
    median: string | null;
    percentile25: string | null;
    percentile75: string | null;
    currency: string | null;
    payPeriod: string | null;
    grossOrNet: string | null;
    experienceLevel: string | null;
    baseYear: number | null;
    baseValue: number | null;
    projectedYear: number | null;
    projectedValue: number | null;
    growthPercent: string | null;
    demandLevel: string | null;
    updatedAt: string;
    source: { id: string; name: string; url: string | null; lastCheckedAt: string | null } | null;
  }[];
  pathway: {
    id: string;
    title: string;
    description: string;
    steps: {
      id: string;
      order: number;
      title: string;
      description: string | null;
      learningObjective: string;
      prerequisites: string | null;
      expectedActivity: string;
      skills: { id: string; name: string }[];
      resources: {
        id: string;
        title: string;
        url: string;
        type: string;
        provider: string;
        costStatus: string;
        status: string;
        lastCheckedDate: string;
      }[];
    }[];
  } | null;
}

/** A career in any status, in the shapes the editor and the tables already use. */
export interface AdminCareerView {
  detail: import("../careerDetail/career.types").ApiCareerDetail;
  pathway: import("../../lib/api/pathways.api").CareerPathwayDto["pathway"] | null;
  /** The live version, which a new revision is based on. */
  version: number;
}
