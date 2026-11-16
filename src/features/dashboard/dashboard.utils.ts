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

/** Good Morning until noon, Good Afternoon until 5pm, then Good Evening (nights included). */
function timeOfDayGreeting(now: Date): string {
  const hour = now.getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  return "Good Evening";
}

/**
 * "Good Morning, Maya" (or Afternoon, Evening) once there is an active pathway,
 * "Welcome, Maya" before that.
 */
export function dashboardGreeting(
  name: string | undefined,
  hasActivePathway: boolean,
  now: Date = new Date(),
): string {
  const greeting = hasActivePathway ? timeOfDayGreeting(now) : "Welcome";
  const firstName = name?.trim().split(/\s+/)[0];
  return firstName ? `${greeting}, ${firstName}` : greeting;
}

interface NamedUser {
  firstName?: string | null;
  fullName?: string | null;
  name?: string | null;
}

/** The first name to greet someone by. The backend's name fields are all nullable. */
export function greetingName(user: NamedUser | null | undefined): string | undefined {
  const candidates = [user?.firstName, user?.fullName, user?.name];
  for (const candidate of candidates) {
    const first = candidate?.trim().split(/\s+/)[0];
    if (first) return first;
  }
  return undefined;
}
