import type { ActivePathwayDto, SavedPathwayDto } from "../../lib/api/progress.api";

export interface DashboardSummary {
  /** False for someone who hasn't built a pathway yet: the dashboard shows its empty state. */
  hasActivePathway: boolean;
  progressPercent: number;
  /** Steps completed in the active pathway only. */
  completedSteps: number;
  totalSteps: number;
  nextStepId: string | null;
  pathwaysCount: number;
}

/** What the backend returns, or is treated as, for someone with no active pathway. */
export const NO_ACTIVE_PATHWAY: ActivePathwayDto = {
  career: null,
  pathway: null,
  progress: null,
  steps: [],
};

export function buildDashboardSummary(
  active: ActivePathwayDto,
  saved: SavedPathwayDto[],
): DashboardSummary {
  const progress = active.career ? active.progress : null;

  return {
    hasActivePathway: progress !== null,
    progressPercent: Math.round(progress?.percentage ?? 0),
    completedSteps: progress?.completed ?? 0,
    totalSteps: progress?.total ?? 0,
    nextStepId: progress?.nextStepId ?? null,
    pathwaysCount: saved.length,
  };
}

/** "Good Morning, Maya" once there's an active pathway, "Welcome, Maya" before that. */
export function dashboardGreeting(
  name: string | undefined,
  hasActivePathway: boolean,
): string {
  const greeting = hasActivePathway ? "Good Morning" : "Welcome";
  const firstName = name?.trim().split(/\s+/)[0];
  return firstName ? `${greeting}, ${firstName}` : greeting;
}
