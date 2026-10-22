import { SKILL_CHECK_CAREERS } from "./skillCheck.mock";
import type { SkillCheckCareer } from "./skillCheck.types";

export const normaliseCareerTitle = (value: string) =>
  value
    .toLowerCase()
    .replace(/engineering|engineer|development|developer/g, "dev")
    .replace(/[^a-z0-9]/g, "");

const ALIASES: Record<string, string[]> = {
  "frontend-developer": ["Web Developer", "Frontend Web Developer", "Web Development"],
  "backend-developer": ["Server Side Developer", "API Developer"],
  "ux-designer": ["UI/UX Designer", "UX/UI Designer", "User Experience Designer"],
  "data-analyst": ["Data Analytics", "Business Data Analyst"],
};

export interface CareerRef {
  title: string;
  slug?: string;
}

export function matchesSkillCheckCareer(career: SkillCheckCareer, ref: CareerRef): boolean {
  const key = normaliseCareerTitle(ref.title);
  if (key === normaliseCareerTitle(career.name)) return true;
  if (ref.slug && normaliseCareerTitle(ref.slug) === normaliseCareerTitle(career.careerId)) {
    return true;
  }
  return (ALIASES[career.careerId] ?? []).some((alias) => normaliseCareerTitle(alias) === key);
}

export function findSkillCheckCareerByTitle(
  title: string,
  slug?: string,
): SkillCheckCareer | null {
  return (
    SKILL_CHECK_CAREERS.find((career) => matchesSkillCheckCareer(career, { title, slug })) ?? null
  );
}

export function hasSkillCheck(title: string, slug?: string): boolean {
  return findSkillCheckCareerByTitle(title, slug)?.reviewed === true;
}
