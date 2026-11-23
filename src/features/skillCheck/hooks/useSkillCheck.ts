import { useQuery } from "@tanstack/react-query";
import { fetchActivePathway } from "../../../lib/api/progress.api";
import { fetchAssessment, fetchSkills } from "../../../lib/api/skills.api";
import { queryKeys } from "../../../lib/queryKeys";
import { retryUnlessClientError } from "../../../lib/queryRetry";
import { useAuthStore } from "../../../lib/stores/authStore";
import { useCareers } from "../../catalog/hooks/useCareers";
import { careerIconKey } from "../../explore/explore.utils";
import { toSkillAssessment } from "../skillCheck.mapping";
import { readCheckedAt } from "../skillCheck.storage";
import type { SkillAssessment, SkillCheckCareerSummary } from "../skillCheck.types";

const STALE_MS = 30 * 1000;

export function useSkillCheckUserId(): string {
  return useAuthStore((state) => state.user?.id ?? "");
}

export function useActivePathwayQuery() {
  const userId = useSkillCheckUserId();
  return useQuery({
    queryKey: queryKeys.progress.active(userId),
    queryFn: fetchActivePathway,
    enabled: userId !== "",
    staleTime: STALE_MS,
    retry: retryUnlessClientError,
  });
}

/** The active pathway's career id, or null when signed out or not following one. */
export function useActiveCareerId(): string | null {
  return useActivePathwayQuery().data?.career?.id ?? null;
}

export type SkillAssessmentState =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "no-pathway" }
  | { kind: "ready"; assessment: SkillAssessment };

/** The active pathway's skill check, joined to its roadmap steps. */
export function useSkillAssessment(): { state: SkillAssessmentState; retry: () => void } {
  const userId = useSkillCheckUserId();
  const activeQuery = useActivePathwayQuery();
  const assessmentQuery = useQuery({
    queryKey: queryKeys.skillCheck.assessment(userId),
    queryFn: fetchAssessment,
    enabled: userId !== "",
    staleTime: STALE_MS,
    retry: retryUnlessClientError,
  });

  const retry = () => {
    void activeQuery.refetch();
    void assessmentQuery.refetch();
  };

  if (activeQuery.isError || assessmentQuery.isError) return { state: { kind: "error" }, retry };
  if (!activeQuery.data || assessmentQuery.data === undefined) {
    return { state: { kind: "loading" }, retry };
  }

  const active = activeQuery.data;
  const assessment = assessmentQuery.data;
  if (!assessment || !active.career) return { state: { kind: "no-pathway" }, retry };
  // Straight after a switch, one of the two can still describe the old pathway.
  if (active.career.id !== assessment.careerId) return { state: { kind: "loading" }, retry };

  return {
    state: {
      kind: "ready",
      assessment: toSkillAssessment(
        assessment,
        active,
        readCheckedAt(userId, assessment.careerId),
      ),
    },
    retry,
  };
}

/** Every published career, with the active one flagged. */
export function useSkillCheckCareers() {
  const careersQuery = useCareers({});
  const activeId = useActiveCareerId();
  const careers: SkillCheckCareerSummary[] | undefined = careersQuery.data?.map((career) => ({
    careerId: career.id,
    name: career.title,
    icon: careerIconKey(career.slug),
    reviewed: career.topicCount > 0,
    isActive: career.id === activeId,
  }));
  return { careers, isError: careersQuery.isError, refetch: careersQuery.refetch };
}

export function useSkillsCatalogue() {
  return useQuery({
    queryKey: queryKeys.skills,
    queryFn: fetchSkills,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
