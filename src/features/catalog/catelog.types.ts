import type { CareerLevel } from "@/types/career.types";

export interface SessionProfile {
  level: CareerLevel | null;
  education: { degree: string; field: string };
  experience: { years: string; internships: string };
  skills: string[];
  interests: string[];
}

export interface CareerListItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
}

export type ApiTargetLevel = "STUDENT" | "RECENT_GRAD" | "EARLY_CAREER";

export const CAREER_FIELDS: { name: string; slug: string }[] = [
  { name: "Software Engineering", slug: "software-engineering" },
  { name: "Data & Analytics", slug: "data-analytics" },
  { name: "Design", slug: "design" },
  { name: "Cloud & Infrastructure", slug: "cloud-infrastructure" },
];

const LEVEL_TO_API: Record<CareerLevel, ApiTargetLevel> = {
  "university-student": "STUDENT",
  "recent-graduate": "RECENT_GRAD",
  "early-career": "EARLY_CAREER",
};

export function toApiLevel(level: CareerLevel | null): ApiTargetLevel | undefined {
  return level ? LEVEL_TO_API[level] : undefined;
}