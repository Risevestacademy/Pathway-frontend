import { useQuery } from "@tanstack/react-query";
import { fetchPathwayOrNull } from "../../../lib/api/pathways.api";
import { useCareers } from "../../catalog/hooks/useCareers";
import { mapPathwayToRoadmap } from "../../pathway/pathway.utils";
import { findSkillCheckCareerByTitle, matchesSkillCheckCareer } from "../careerMatch";

export function useRealCareerId(title: string | null): string | null {
  const { data } = useCareers({});
  if (!title || !Array.isArray(data)) return null;
  const skillCheckCareer = findSkillCheckCareerByTitle(title);
  if (!skillCheckCareer) return null;
  return (
    data.find((career) =>
      matchesSkillCheckCareer(skillCheckCareer, { title: career.title, slug: career.slug }),
    )?.id ?? null
  );
}

export function useRealRoadmap(title: string | null) {
  const careerId = useRealCareerId(title);
  const query = useQuery({
    queryKey: ["real-roadmap", careerId],
    queryFn: async () => {
      const pathway = await fetchPathwayOrNull(careerId as string);
      return pathway ? (mapPathwayToRoadmap(pathway)?.roadmap?.steps ?? []) : [];
    },
    enabled: careerId !== null,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  return { careerId, steps: query.data ?? [] };
}
