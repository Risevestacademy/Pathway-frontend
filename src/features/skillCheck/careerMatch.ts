import { SKILL_CHECK_CAREERS } from "./skillCheck.mock";
import type { SkillCheckCareer } from "./skillCheck.types";

export const normaliseCareerTitle = (value: string) =>
  value
    .toLowerCase()
    .replace(/engineering|engineer|development|developer/g, "dev")
    .replace(/[^a-z0-9]/g, "");

export function findSkillCheckCareerByTitle(title: string): SkillCheckCareer | null {
  const key = normaliseCareerTitle(title);
  return SKILL_CHECK_CAREERS.find((career) => normaliseCareerTitle(career.name) === key) ?? null;
}

export function hasSkillCheck(title: string): boolean {
  return findSkillCheckCareerByTitle(title)?.reviewed === true;
}
