import { useQuery } from "@tanstack/react-query";
import { fetchPathwayById } from "../../lib/api/pathways.api";
import { queryKeys } from "../../lib/queryKeys";
import { useCareerPathwayData } from "../pathwayRoadmap/hooks/useCareerPathwayData";
import type { QuizStageRef } from "./completedStage";

/**
 * The stages of a career's pathway, each with the ids of its steps. Empty until
 * they load, and when they can't be loaded: the quiz is optional, so a page that
 * offers it should carry on without it rather than fail.
 */
export function usePathwayStages(careerId: string): QuizStageRef[] {
  const { data: roadmap } = useCareerPathwayData(careerId);
  const pathwayId = roadmap.kind === "ready" ? roadmap.pathway.id : null;

  const detailQuery = useQuery({
    queryKey: queryKeys.pathwayDetail(pathwayId ?? ""),
    queryFn: () => fetchPathwayById(pathwayId as string),
    enabled: pathwayId !== null,
  });

  return (detailQuery.data?.stages ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((stage) => ({
      id: stage.id,
      title: stage.title,
      stepIds: stage.steps.map((step) => step.id),
    }));
}
