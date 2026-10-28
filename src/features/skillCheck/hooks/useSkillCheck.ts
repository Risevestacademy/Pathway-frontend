import { queryOptions, useQuery } from "@tanstack/react-query";
import {
  fetchActiveCareerId,
  fetchSkillCheckCareer,
  fetchSkillCheckCareers,
  fetchSkillCheckRecord,
  fetchSkillRatings,
} from "../../../lib/api/skillCheck.api";
import { queryKeys } from "../../../lib/queryKeys";
import { useAuthStore } from "../../../lib/stores/authStore";

export function useSkillCheckUserId(): string {
  return useAuthStore((state) => state.user?.id ?? "anonymous");
}

export const skillCheckCareerQuery = (careerId: string) =>
  queryOptions({
    queryKey: queryKeys.skillCheck.career(careerId),
    queryFn: () => fetchSkillCheckCareer(careerId),
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export function useSkillCheckCareers() {
  const userId = useSkillCheckUserId();
  return useQuery({
    queryKey: queryKeys.skillCheck.careers(userId),
    queryFn: () => fetchSkillCheckCareers(userId),
  });
}

export function useSkillCheckCareer(careerId: string) {
  return useQuery(skillCheckCareerQuery(careerId));
}

export function useSkillCheckRecord(careerId: string) {
  const userId = useSkillCheckUserId();
  return useQuery({
    queryKey: queryKeys.skillCheck.record(userId, careerId),
    queryFn: () => fetchSkillCheckRecord(userId, careerId),
  });
}

export function useActiveCareerId() {
  const userId = useSkillCheckUserId();
  return useQuery({
    queryKey: queryKeys.skillCheck.activeCareer(userId),
    queryFn: () => fetchActiveCareerId(userId),
  });
}

export function useSkillRatings() {
  const userId = useSkillCheckUserId();
  return useQuery({
    queryKey: queryKeys.skillCheck.ratings(userId),
    queryFn: () => fetchSkillRatings(userId),
  });
}
