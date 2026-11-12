import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  completeSkillCheck,
  resolveStartingPoint,
  saveSkillCheckDraft,
  saveSkillRating,
  startSkillCheck,
  switchActiveCareer,
} from "../../../lib/api/skillCheck.api";
import { createRating } from "../rating.utils";
import type {
  RatingValue,
  SkillAnswerMap,
  StartingPoint,
} from "../skillCheck.types";
import { activateOnServer, startingPointOnServer } from "./activePathwaySync";
import { useSkillCheckUserId } from "./useSkillCheck";
import { queryKeys } from "../../../lib/queryKeys";

function useInvalidateUser() {
  const queryClient = useQueryClient();
  const userId = useSkillCheckUserId();
  return () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.skillCheck.user(userId),
    });
}

export function useStartSkillCheck() {
  const userId = useSkillCheckUserId();
  const invalidate = useInvalidateUser();
  return useMutation({
    mutationFn: (careerId: string) => startSkillCheck(userId, careerId),
    onSuccess: invalidate,
  });
}

export function useSaveSkillCheckDraft(careerId: string) {
  const userId = useSkillCheckUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { draft: SkillAnswerMap; areaId: string | null }) =>
      saveSkillCheckDraft(userId, careerId, input.draft, input.areaId),
    onSuccess: (record) => {
      queryClient.setQueryData(queryKeys.skillCheck.record(userId, careerId), record);
    },
  });
}

export function useCompleteSkillCheck(careerId: string) {
  const userId = useSkillCheckUserId();
  const invalidate = useInvalidateUser();
  return useMutation({
    mutationFn: () => completeSkillCheck(userId, careerId),
    onSuccess: invalidate,
  });
}

/**
 * Saves where the person starts. A chosen step is sent to the server first, so
 * the dashboard points at the right step too, and if the server refuses nothing
 * changes here either. Keeping the current one (null) changes nothing, so the
 * server isn't told.
 */
export function useResolveStartingPoint(careerId: string) {
  const userId = useSkillCheckUserId();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateUser();
  return useMutation({
    mutationFn: async (startingPoint: StartingPoint | null) => {
      if (startingPoint) {
        await startingPointOnServer(queryClient, careerId, startingPoint.stepOrder);
      }
      return resolveStartingPoint(userId, careerId, startingPoint);
    },
    onSuccess: invalidate,
  });
}

/**
 * Makes a career the active pathway. The server is told first, so the dashboard
 * sees it too, and if it refuses nothing changes here either. A career with no
 * match in the real catalogue is only switched in My Pathway.
 */
export function useSwitchActiveCareer() {
  const userId = useSkillCheckUserId();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateUser();
  return useMutation({
    mutationFn: async (careerId: string) => {
      await activateOnServer(queryClient, careerId);
      return switchActiveCareer(userId, careerId);
    },
    onSuccess: invalidate,
  });
}

export function useSaveSkillRating(careerId: string) {
  const userId = useSkillCheckUserId();
  const invalidate = useInvalidateUser();
  return useMutation({
    mutationFn: (input: { skillId: string; value: RatingValue | "NOT_SURE" }) =>
      saveSkillRating(userId, createRating(careerId, input.skillId, input.value)),
    onSuccess: invalidate,
  });
}
