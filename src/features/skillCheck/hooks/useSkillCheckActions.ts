import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setActivePathway } from "../../../lib/api/progress.api";
import { fetchProfile } from "../../../lib/api/users.api";
import {
  resetAssessment,
  saveAssessment,
  updateMySkills,
  type AssessmentSkillInput,
} from "../../../lib/api/skills.api";
import { queryKeys } from "../../../lib/queryKeys";
import { clearDraft } from "../skillCheck.storage";
import { useSkillCheckUserId } from "./useSkillCheck";

/** Saving or clearing answers moves the starting step and changes the profile's skills. */
function useRefreshAfterSkillChange() {
  const queryClient = useQueryClient();
  const userId = useSkillCheckUserId();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.skillCheck.assessments(userId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.progress.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) }),
    ]);
}

/** Saves the finished questionnaire and forgets the draft on this device. */
export function useSaveAssessment(careerId: string) {
  const userId = useSkillCheckUserId();
  const refresh = useRefreshAfterSkillChange();
  return useMutation({
    mutationFn: (skills: AssessmentSkillInput[]) => saveAssessment(skills),
    onSuccess: async () => {
      clearDraft(userId, careerId);
      await refresh();
    },
  });
}

/** Saves a rating, which only a skill marked Have can carry. */
export function useSaveSkillRating() {
  const refresh = useRefreshAfterSkillChange();
  return useMutation({
    mutationFn: ({ skillId, rating }: { skillId: string; rating: number }) =>
      saveAssessment([{ skillId, status: "HAVE", rating }]),
    onSuccess: () => refresh(),
  });
}

export function useResetAssessment(careerId: string) {
  const userId = useSkillCheckUserId();
  const refresh = useRefreshAfterSkillChange();
  return useMutation({
    mutationFn: resetAssessment,
    onSuccess: async () => {
      clearDraft(userId, careerId);
      await refresh();
    },
  });
}

/** Makes the career the active pathway, so its skills can be checked. */
export function useSwitchPathway() {
  const queryClient = useQueryClient();
  const userId = useSkillCheckUserId();
  return useMutation({
    mutationFn: setActivePathway,
    onSuccess: async (active) => {
      queryClient.setQueryData(queryKeys.progress.active(userId), active);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.skillCheck.assessments(userId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.progress.saved(userId) }),
      ]);
    },
  });
}

/** Replaces the profile's skills with exactly this list. */
export function useUpdateMySkills() {
  const refresh = useRefreshAfterSkillChange();
  return useMutation({
    mutationFn: updateMySkills,
    onSuccess: () => refresh(),
  });
}

/** Adds skills to the profile without dropping any already there, since the server replaces the whole list. */
export function useAddMySkills() {
  const refresh = useRefreshAfterSkillChange();
  return useMutation({
    mutationFn: async (skillIds: string[]) => {
      const current = (await fetchProfile()).skills?.map((skill) => skill.id) ?? [];
      const merged = [...new Set([...current, ...skillIds])];
      if (merged.length === current.length) return;
      await updateMySkills(merged);
    },
    onSuccess: () => refresh(),
  });
}
