import { isAxiosError } from "axios";
import { api } from "./axios";

/** How a learner answered for one skill. A skill they never answered reads NOT_SURE. */
export type UserSkillStatus = "HAVE" | "DONT_HAVE" | "NOT_SURE";

/** A skill from the catalogue, as returned by GET /skills. */
export interface SkillDto {
  id: string;
  name: string;
  description: string | null;
}

export interface AssessmentSkillDto {
  skillId: string;
  skillName: string;
  status: UserSkillStatus;
  /** 1 to 5, and only ever set when status is HAVE. */
  rating: number | null;
}

export interface AssessmentStageDto {
  stageId: string;
  stageTitle: string;
  stageOrder: number;
  /** Each skill appears once, under the first stage that teaches it. */
  skills: AssessmentSkillDto[];
}

/** GET /me/skills/assessment: the active pathway's skills, grouped by stage. */
export interface AssessmentDto {
  careerId: string;
  pathwayId: string;
  stages: AssessmentStageDto[];
}

export interface AssessmentSkillInput {
  skillId: string;
  status: UserSkillStatus;
  /** 1 to 5. Only allowed when status is HAVE; leaving it out clears a saved rating. */
  rating?: number;
}

export interface SkillGapDto {
  skillId: string;
  skillName: string;
  stepId: string;
  stepTitle: string;
  stepOrder: number;
}

/** PUT /me/skills/assessment. The server also moves the pathway's starting step. */
export interface SaveAssessmentResponseDto {
  updated: number;
  allGapsClosed: boolean;
  startStepId: string | null;
  startStepTitle: string | null;
  startStepDescription: string | null;
  stats: { have: number; dontHave: number; notSure: number };
  gaps: SkillGapDto[];
}

export async function fetchSkills(): Promise<SkillDto[]> {
  const { data } = await api.get<SkillDto[]>("/skills");
  return data;
}

/** Resolves to null when the learner has no active pathway (404 NO_ACTIVE_PATHWAY). */
export async function fetchAssessment(): Promise<AssessmentDto | null> {
  try {
    const { data } = await api.get<AssessmentDto>("/me/skills/assessment");
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}

export async function saveAssessment(
  skills: AssessmentSkillInput[],
): Promise<SaveAssessmentResponseDto> {
  const { data } = await api.put<SaveAssessmentResponseDto>("/me/skills/assessment", {
    skills,
  });
  return data;
}

/** Clears the active pathway's answers, ratings and starting step. */
export async function resetAssessment(): Promise<void> {
  await api.delete("/me/skills/assessment");
}

/**
 * Replaces the learner's profile skills. Any skill left out is removed, along
 * with its skill check answer, so callers send the full list they want kept.
 */
export async function updateMySkills(skillIds: string[]): Promise<void> {
  await api.put("/me/skills", { skillIds });
}
