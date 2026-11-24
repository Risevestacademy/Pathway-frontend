import { api } from "./axios";
import type { PathwayStepStatus } from "./progress.api";

export interface DashboardDayDto {
  date: string;
  active: boolean;
}

export interface DashboardHeatmapDayDto {
  date: string;
  count: number;
}

export interface DashboardBadgeDto {
  id: string;
  name: string;
  description: string;
  iconKey: string;
  xpThreshold: number;
  awardedAt: string;
}

export type DashboardGoalKind = "STEP" | "TASK" | "CHECKLIST" | "RESOURCE";

export interface DashboardGoalDto {
  kind: DashboardGoalKind;
  id: string;
  title: string;
  /** Null for goals that award no XP of their own, such as checklists. */
  xp: number | null;
  done: boolean;
  goalDescription: string | null;
}

export interface DashboardProjectStepDto {
  id: string;
  title: string;
  order: number;
  status: PathwayStepStatus;
}

export interface DashboardCurrentProjectDto {
  stageId: string;
  stageTitle: string;
  stageDescription: string;
  stageOrder: number;
  completed: number;
  total: number;
  percentage: number;
  skills: string[];
  steps: DashboardProjectStepDto[];
}

export interface DashboardActivePathwayDto {
  pathwayId: string;
  career: { id: string; title: string; description: string; retired: boolean };
  progress: {
    completed: number;
    total: number;
    percentage: number;
    nextStepId: string | null;
    selfReported: boolean;
  };
}

export interface DashboardDto {
  totals: {
    savedPathways: number;
    completedSteps: number;
    xp: number;
    badgesEarned: number;
    badgesTotal: number;
  };
  streak: { current: number; longest: number };
  weekStrip: { days: DashboardDayDto[]; currentStreak: number };
  heatmap: { from: string; to: string; days: DashboardHeatmapDayDto[] };
  badges: DashboardBadgeDto[];
  /** Null until the person has an active pathway. */
  activePathway: DashboardActivePathwayDto | null;
  /** Null when there is no current stage to show. */
  currentProject: DashboardCurrentProjectDto | null;
  goals: DashboardGoalDto[];
}

/** Everything the dashboard shows, in one request. A 401 means the session has expired. */
export async function fetchDashboard(): Promise<DashboardDto> {
  const { data } = await api.get<DashboardDto>("/me/dashboard");
  return data;
}
