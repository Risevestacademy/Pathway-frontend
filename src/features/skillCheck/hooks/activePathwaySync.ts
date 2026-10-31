import type { QueryClient } from "@tanstack/react-query";
import { fetchCareers } from "../../../lib/api/careers.api";
import { fetchPathwayOrNull } from "../../../lib/api/pathways.api";
import {
  StartingPointError,
  setActivePathway,
  setPathwayStepStatus,
  setStartingPoint,
} from "../../../lib/api/progress.api";
import { fetchCompletedSteps } from "../../../lib/api/roadmapPreview.api";
import { fetchSkillCheckRecord } from "../../../lib/api/skillCheck.api";
import { queryKeys } from "../../../lib/queryKeys";
import type { ActivePathway } from "../../progress/progress.types";
import { resolveRealCareerId } from "../careerMatch";

/** The real catalogue career a My Pathway career stands for, or null if there isn't one. */
export async function realCareerIdFor(
  queryClient: QueryClient,
  skillCheckCareerId: string,
): Promise<string | null> {
  const careers = await queryClient.ensureQueryData({
    queryKey: queryKeys.careers.list({}),
    queryFn: () => fetchCareers({}),
  });
  return resolveRealCareerId(careers, skillCheckCareerId);
}

/**
 * The real pathway's step ids, in order. My Pathway numbers its steps 1, 2, 3…,
 * and the real pathway's step at the same place is the one it stands for.
 */
export async function realStepIdsFor(
  queryClient: QueryClient,
  realCareerId: string,
): Promise<string[]> {
  const pathway = await queryClient.ensureQueryData({
    queryKey: queryKeys.pathway(realCareerId),
    queryFn: () => fetchPathwayOrNull(realCareerId),
  });
  return [...(pathway?.steps ?? [])].sort((a, b) => a.order - b.order).map((step) => step.id);
}

/** The saved pathways and the active pathway both carry progress, so both are refreshed. */
async function refreshProgress(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.me.pathways }),
    queryClient.invalidateQueries({ queryKey: queryKeys.me.activePathway }),
  ]);
}

/**
 * Makes a My Pathway career the active pathway on the server too, so the
 * dashboard and anything else that reads saved pathways agree with My Pathway.
 *
 * Returns false, without calling the server, for a career the real catalogue
 * has no match for: those can only live in My Pathway. Throws if the server
 * refuses (an unpublished career, or one with no pathway yet).
 */
export async function activateOnServer(
  queryClient: QueryClient,
  skillCheckCareerId: string,
): Promise<boolean> {
  const realId = await realCareerIdFor(queryClient, skillCheckCareerId);
  if (!realId) return false;

  await setActivePathway(realId);
  await queryClient.invalidateQueries({ queryKey: queryKeys.me.pathways });
  return true;
}

/**
 * Tells the server which step a person starts from (My Pathway's step number,
 * mapped to the real step). If the pathway isn't saved there yet (404), it is
 * saved first and the step is sent again once.
 *
 * Returns false for a career or step the real catalogue has no match for.
 */
export async function startingPointOnServer(
  queryClient: QueryClient,
  skillCheckCareerId: string,
  stepOrder: number,
): Promise<boolean> {
  const realId = await realCareerIdFor(queryClient, skillCheckCareerId);
  if (!realId) return false;
  const stepId = (await realStepIdsFor(queryClient, realId))[stepOrder - 1];
  if (!stepId) return false;

  try {
    await setStartingPoint(realId, stepId);
  } catch (error) {
    if (!(error instanceof StartingPointError) || error.status !== 404) throw error;
    await activateOnServer(queryClient, skillCheckCareerId);
    await setStartingPoint(realId, stepId);
  }
  await refreshProgress(queryClient);
  return true;
}

/**
 * Catches the server up with what My Pathway already holds for the pathway the
 * server shows as active: the step they start from, and the steps they have
 * marked done. Only what the server is missing is sent. Nothing happens if the
 * server's active pathway isn't the one My Pathway has active.
 *
 * Returns whether anything was sent.
 */
export async function syncLocalProgress(
  queryClient: QueryClient,
  userId: string,
  skillCheckCareerId: string,
  active: ActivePathway,
): Promise<boolean> {
  const realId = await realCareerIdFor(queryClient, skillCheckCareerId);
  if (!realId || active.career?.id !== realId) return false;

  const [record, completedOrders, stepIds] = await Promise.all([
    fetchSkillCheckRecord(userId, skillCheckCareerId),
    fetchCompletedSteps(userId, skillCheckCareerId),
    realStepIdsFor(queryClient, realId),
  ]);

  let changed = false;

  const startOrder = record?.startingPoint?.stepOrder;
  const startId = startOrder ? stepIds[startOrder - 1] : undefined;
  if (startId && active.progress?.startStepId !== startId) {
    await setStartingPoint(realId, startId);
    changed = true;
  }

  const doneOnServer = new Set(
    active.steps.filter((step) => step.status === "COMPLETED").map((step) => step.id),
  );
  for (const order of [...completedOrders].sort((a, b) => a - b)) {
    const stepId = stepIds[order - 1];
    if (stepId && !doneOnServer.has(stepId)) {
      await setPathwayStepStatus(stepId, "COMPLETED");
      changed = true;
    }
  }

  if (changed) await refreshProgress(queryClient);
  return changed;
}
