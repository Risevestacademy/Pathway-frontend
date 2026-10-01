import type { CareerLevel } from "@/types/career.types";

export interface SessionProfile {
  level: CareerLevel | null;
  education: { degree: string; field: string };
  experience: { years: string; internships: string };
  skills: string[];
  interest: string | null;
}

/** A published career as returned by GET /careers. */
export interface CareerListItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
}

/** A career field as returned by GET /fields. */
export interface CareerField {
  id: string;
  name: string;
  slug: string;
}

export type ApiTargetLevel = "STUDENT" | "RECENT_GRAD" | "EARLY_CAREER";

const LEVEL_TO_API: Record<CareerLevel, ApiTargetLevel> = {
  "university-student": "STUDENT",
  "recent-graduate": "RECENT_GRAD",
  "early-career": "EARLY_CAREER",
};

export function toApiLevel(level: CareerLevel | null): ApiTargetLevel | undefined {
  return level ? LEVEL_TO_API[level] : undefined;
}
