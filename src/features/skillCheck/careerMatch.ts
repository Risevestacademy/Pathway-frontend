import { SKILL_CHECK_CAREERS } from "./skillCheck.mock";
import type { SkillCheckCareer } from "./skillCheck.types";

const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

export function findSkillCheckCareerByTitle(title: string): SkillCheckCareer | null {
  const key = normalise(title);
  return SKILL_CHECK_CAREERS.find((career) => normalise(career.name) === key) ?? null;
}
