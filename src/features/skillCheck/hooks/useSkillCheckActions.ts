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
import { skillCheckKeys, useSkillCheckUserId } from "./useSkillCheck";

function useInvalidateUser() {
  const queryClient = useQueryClient();
  const userId = useSkillCheckUserId();
  return () =>
    queryClient.invalidateQueries({
      queryKey: ["skill-check", userId],
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
      queryClient.setQueryData(skillCheckKeys.record(userId, careerId), record);
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

export function useResolveStartingPoint(careerId: string) {
  const userId = useSkillCheckUserId();
  const invalidate = useInvalidateUser();
  return useMutation({
    mutationFn: (startingPoint: StartingPoint | null) =>
      resolveStartingPoint(userId, careerId, startingPoint),
    onSuccess: invalidate,
  });
}

export function useSwitchActiveCareer() {
  const userId = useSkillCheckUserId();
  const invalidate = useInvalidateUser();
  return useMutation({
    mutationFn: (careerId: string) => switchActiveCareer(userId, careerId),
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
