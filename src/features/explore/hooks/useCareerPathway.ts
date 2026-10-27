import { useQuery } from "@tanstack/react-query";
import { fetchPathwayOrNull } from "@/lib/api/pathways.api";

export interface PathwaySummary {
  stages: number;
  resources: number;
  firstStep: string | null;
}

/** Stage and resource counts plus the first step, for the career profile page. */
export function useCareerPathway(careerId: string) {
  return useQuery({
    queryKey: ["pathway", careerId],
    queryFn: () => fetchPathwayOrNull(careerId),
    select: (pathway): PathwaySummary | null => {
      if (!pathway) return null;
      const steps = [...pathway.steps].sort((a, b) => a.order - b.order);
      return {
        stages: steps.length,
        resources: steps.reduce((total, step) => total + step.resources.length, 0),
        firstStep: steps[0]?.title ?? null,
      };
    },
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
