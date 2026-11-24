import type { UserSkillStatus } from "../../lib/api/skills.api";

export type SkillAnswer = UserSkillStatus;

export type SkillAnswerMap = Record<string, SkillAnswer>;

export type TrackIconKey =
  | "frontend-developer"
  | "backend-developer"
  | "full-stack-developer"
  | "devops-engineer"
  | "ai-engineer"
  | "data-analyst"
  | "ux-designer"
  | "ux-researcher"
  | "product-designer"
  | "product-manager"
  | "software-developer";

export interface SkillCheckStep {
  id: string;
  order: number;
  title: string;
}

/** A stage of the pathway. The questionnaire asks about one stage at a time. */
export interface SkillCheckArea {
  id: string;
  name: string;
}

export interface SkillCheckSkill {
  id: string;
  areaId: string;
  name: string;
  /** The first roadmap step that teaches it, or null when no step does. */
  stepOrder: number | null;
}

/** The active pathway's skill check: its skills, and what the learner has saved. */
export interface SkillAssessment {
  careerId: string;
  name: string;
  icon: TrackIconKey | null;
  areas: SkillCheckArea[];
  skills: SkillCheckSkill[];
  steps: SkillCheckStep[];
  /** The saved answers. A skill never answered has none. */
  saved: SkillAnswerMap;
  /** Saved ratings, 1 to 5, for skills marked HAVE. */
  ratings: Record<string, number>;
  /** Set by the server when the answers are saved. */
  startStepId: string | null;
  /** Whether the check was ever taken for this pathway. */
  hasResult: boolean;
  /** When the learner last answered, or null if never. */
  checkedAt: string | null;
}

export interface SkillCheckCareerSummary {
  careerId: string;
  name: string;
  icon: TrackIconKey | null;
  /** Whether the career has a roadmap to check against. */
  reviewed: boolean;
  isActive: boolean;
}

export interface SkillCounts {
  have: number;
  dontHave: number;
  notSure: number;
  unanswered: number;
}

export interface SkillGap {
  skill: SkillCheckSkill;
  answer: Exclude<SkillAnswer, "HAVE">;
  step: SkillCheckStep;
}

export interface SkillCheckResult {
  counts: SkillCounts;
  gaps: SkillGap[];
  startStep: SkillCheckStep | null;
}

/** Answers in progress, kept on this device until the check is finished. */
export interface SkillCheckDraft {
  answers: SkillAnswerMap;
  areaId: string | null;
}

export type RatingValue = 1 | 2 | 3 | 4 | 5;
