import { queryOptions, useQuery } from "@tanstack/react-query";
import {
  fetchActiveCareerId,
  fetchSkillCheckCareer,
  fetchSkillCheckCareers,
  fetchSkillCheckRecord,
  fetchSkillRatings,
} from "../../../lib/api/skillCheck.api";
import { useAuthStore } from "../../../lib/stores/authStore";

export const skillCheckKeys = {
  all: ["skill-check"] as const,
  careers: (userId: string) => ["skill-check", userId, "careers"] as const,
  career: (careerId: string) => ["skill-check", "career", careerId] as const,
  record: (userId: string, careerId: string) =>
    ["skill-check", userId, "record", careerId] as const,
  activeCareer: (userId: string) =>
    ["skill-check", userId, "active-career"] as const,
  ratings: (userId: string) => ["skill-check", userId, "ratings"] as const,
};

export function useSkillCheckUserId(): string {
  return useAuthStore((state) => state.user?.id ?? "anonymous");
}

export const skillCheckCareerQuery = (careerId: string) =>
  queryOptions({
    queryKey: skillCheckKeys.career(careerId),
    queryFn: () => fetchSkillCheckCareer(careerId),
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export function useSkillCheckCareers() {
  const userId = useSkillCheckUserId();
  return useQuery({
    queryKey: skillCheckKeys.careers(userId),
    queryFn: () => fetchSkillCheckCareers(userId),
  });
}

export function useSkillCheckCareer(careerId: string) {
  return useQuery(skillCheckCareerQuery(careerId));
}

export function useSkillCheckRecord(careerId: string) {
  const userId = useSkillCheckUserId();
  return useQuery({
    queryKey: skillCheckKeys.record(userId, careerId),
    queryFn: () => fetchSkillCheckRecord(userId, careerId),
  });
}

export function useActiveCareerId() {
  const userId = useSkillCheckUserId();
  return useQuery({
    queryKey: skillCheckKeys.activeCareer(userId),
    queryFn: () => fetchActiveCareerId(userId),
  });
}

export function useSkillRatings() {
  const userId = useSkillCheckUserId();
  return useQuery({
    queryKey: skillCheckKeys.ratings(userId),
    queryFn: () => fetchSkillRatings(userId),
  });
}
