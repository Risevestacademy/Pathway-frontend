import { useQueries, useQuery } from "@tanstack/react-query";
import { fetchPathwayOrNull, type CareerPathwayDto } from "../../../lib/api/pathways.api";
import { fetchActivePathway } from "../../../lib/api/progress.api";
import { fetchAssessment, fetchSkills } from "../../../lib/api/skills.api";
import { queryKeys } from "../../../lib/queryKeys";
import { retryUnlessClientError } from "../../../lib/queryRetry";
import { useAuthStore } from "../../../lib/stores/authStore";
import { useCareers } from "../../catalog/hooks/useCareers";
import { careerIconKey } from "../../explore/explore.utils";
import { toSkillAssessment } from "../skillCheck.mapping";
import type { SkillAssessment, SkillCheckCareerSummary } from "../skillCheck.types";

const STALE_MS = 30 * 1000;
// Matches the other roadmap queries, which share this cache.
const ROADMAP_STALE_MS = 15 * 60 * 1000;

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
  const activeCareerId = activeQuery.data?.career?.id ?? null;
  const assessmentQuery = useQuery({
    // Keyed by the active career, so a switch made anywhere fetches the new one.
    queryKey: queryKeys.skillCheck.assessment(userId, activeCareerId ?? ""),
    queryFn: fetchAssessment,
    enabled: userId !== "" && activeCareerId !== null,
    staleTime: STALE_MS,
    retry: retryUnlessClientError,
  });

  const retry = () => {
    void activeQuery.refetch();
    if (activeCareerId) void assessmentQuery.refetch();
  };

  if (activeQuery.isError || assessmentQuery.isError) return { state: { kind: "error" }, retry };
  if (!activeQuery.data) return { state: { kind: "loading" }, retry };

  const active = activeQuery.data;
  if (!active.career) return { state: { kind: "no-pathway" }, retry };
  if (assessmentQuery.data === undefined) return { state: { kind: "loading" }, retry };

  const assessment = assessmentQuery.data;
  if (!assessment) return { state: { kind: "no-pathway" }, retry };
  // The server switched again between the two reads; the next refetch settles it.
  if (active.career.id !== assessment.careerId) return { state: { kind: "loading" }, retry };

  return {
    state: {
      kind: "ready",
      assessment: toSkillAssessment(assessment, active),
    },
    retry,
  };
}

/** Whether any step of the pathway lists a skill to check. */
export function pathwayHasSkills(pathway: CareerPathwayDto["pathway"] | null): boolean {
  return pathway?.steps.some((step) => step.skills.length > 0) ?? false;
}

function pathwayQuery(careerId: string) {
  return {
    queryKey: queryKeys.pathway(careerId),
    queryFn: () => fetchPathwayOrNull(careerId),
    staleTime: ROADMAP_STALE_MS,
    refetchOnWindowFocus: false,
  };
}

/** Whether the career's roadmap has skills to check: undefined while it loads. */
export function useCareerHasSkills(careerId: string | null): boolean | undefined {
  const { data, isError } = useQuery({
    ...pathwayQuery(careerId ?? ""),
    enabled: careerId !== null,
    retry: false,
  });
  if (careerId === null || isError) return false;
  return data === undefined ? undefined : pathwayHasSkills(data);
}

/**
 * Every published career, with the active one flagged. A career only counts
 * as ready once its roadmap lists skills, so nobody is switched to a pathway
 * with nothing to check. Undefined until that is known for every career.
 */
export function useSkillCheckCareers() {
  const careersQuery = useCareers({});
  const activeId = useActiveCareerId();
  const list = careersQuery.data;
  // A career without steps has no skills either, so it needs no roadmap read.
  const withSteps = (list ?? []).filter((career) => career.topicCount > 0);
  const roadmaps = useQueries({
    queries: withSteps.map((career) => ({ ...pathwayQuery(career.id), retry: false })),
  });

  const loading = roadmaps.some((roadmap) => roadmap.isPending);
  const hasSkills = new Map(
    withSteps.map((career, index) => [career.id, pathwayHasSkills(roadmaps[index]?.data ?? null)]),
  );

  const careers: SkillCheckCareerSummary[] | undefined =
    list && !loading
      ? list.map((career) => ({
          careerId: career.id,
          name: career.title,
          icon: careerIconKey(career.slug),
          reviewed: hasSkills.get(career.id) ?? false,
          isActive: career.id === activeId,
        }))
      : undefined;

  const refetch = () => {
    void careersQuery.refetch();
    roadmaps.forEach((roadmap) => {
      if (roadmap.isError) void roadmap.refetch();
    });
  };

  return { careers, isError: careersQuery.isError, refetch };
}

export function useSkillsCatalogue() {
  return useQuery({
    queryKey: queryKeys.skills,
    queryFn: fetchSkills,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
