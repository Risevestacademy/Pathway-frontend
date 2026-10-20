export type SkillAnswer = "HAVE" | "NOT_YET" | "NOT_SURE";

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
  order: number;
  title: string;
}

export interface SkillCheckArea {
  id: string;
  name: string;
}

export interface SkillCheckSkill {
  id: string;
  areaId: string;
  name: string;
  description: string;
  reason: string;
  stepOrder: number;
}

export interface SkillCheckCareer {
  careerId: string;
  name: string;
  icon: TrackIconKey;
  reviewed: boolean;
  areas: SkillCheckArea[];
  skills: SkillCheckSkill[];
  steps: SkillCheckStep[];
}

export interface SkillCheckCareerSummary {
  careerId: string;
  name: string;
  icon: TrackIconKey;
  reviewed: boolean;
  isActive: boolean;
  hasResult: boolean;
}

export interface SkillCounts {
  have: number;
  notYet: number;
  notSure: number;
  unanswered: number;
}

export interface SkillGap {
  skill: SkillCheckSkill;
  answer: Exclude<SkillAnswer, "HAVE">;
  step: SkillCheckStep;
}

export interface StartSuggestion {
  stepOrder: number;
  reasonSkills: SkillCheckSkill[];
  coveredStepOrders: number[];
}

export interface SkillCheckResult {
  counts: SkillCounts;
  gaps: SkillGap[];
  suggestion: StartSuggestion | null;
}

export type StartingPointSource = "ACCEPTED" | "DECLINED";

export interface StartingPoint {
  stepOrder: number;
  source: StartingPointSource;
}

export interface SkillCheckRecord {
  careerId: string;
  answers: SkillAnswerMap;
  previousAnswers: SkillAnswerMap | null;
  draft: SkillAnswerMap | null;
  draftAreaId: string | null;
  completedAt: string | null;
  startingPoint: StartingPoint | null;
  needsDecision: boolean;
}

export interface SkillCheckUserState {
  activeCareerId: string | null;
  records: Record<string, SkillCheckRecord>;
  ratings: SkillRating[];
}

export type RatingValue = 0 | 1 | 2 | 3 | 4 | 5;

export interface SkillRating {
  skillId: string;
  careerId: string;
  value: RatingValue | "NOT_SURE";
  scaleVersion: number;
  ratedAt: string;
}

export type RatingTrend =
  | { kind: "none" }
  | { kind: "baseline"; value: RatingValue }
  | { kind: "not-enough" }
  | { kind: "change"; from: RatingValue; to: RatingValue; delta: number };
