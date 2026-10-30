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
