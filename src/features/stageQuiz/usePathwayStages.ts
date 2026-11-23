import { useQuery } from "@tanstack/react-query";
import { fetchPathwayById } from "../../lib/api/pathways.api";
import { queryKeys } from "../../lib/queryKeys";
import { useCareerPathwayData } from "../pathwayRoadmap/hooks/useCareerPathwayData";
import type { QuizStageRef } from "./completedStage";

/**
 * The stages of a career's pathway, each with the ids of its steps. The quiz is
 * optional, so a page that offers it carries on without the stages rather than
 * failing, but it can say they couldn't be loaded, and retry.
 */
export function usePathwayStages(careerId: string): {
  stages: QuizStageRef[];
  /** The stages couldn't be loaded: the request failed, or the pathway can't be read. */
  failed: boolean;
  retry: () => void;
} {
  const { data: roadmap } = useCareerPathwayData(careerId);
  const pathwayId = roadmap.kind === "ready" ? roadmap.pathway.id : null;

  const detailQuery = useQuery({
    queryKey: queryKeys.pathwayDetail(pathwayId ?? ""),
    queryFn: () => fetchPathwayById(pathwayId as string),
    enabled: pathwayId !== null,
  });

  const stages = (detailQuery.data?.stages ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((stage) => ({
      id: stage.id,
      title: stage.title,
      stepIds: stage.steps.map((step) => step.id),
    }));

  return {
    stages,
    failed: detailQuery.isError || detailQuery.data === null,
    retry: () => void detailQuery.refetch(),
  };
}
