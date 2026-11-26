import { useQuery } from "@tanstack/react-query";
import { fetchQuiz } from "../../lib/api/pathwayQuiz.api";
import { queryKeys } from "../../lib/queryKeys";
import { useCareerPathwayData } from "../pathwayRoadmap/hooks/useCareerPathwayData";

/**
 * Whether a stage has a quiz to take. The pathway read doesn't say, only the
 * quiz itself does (it answers 404 when there is none), so this looks it up.
 * It shares the quiz page's cache entry, so opening the quiz asks for nothing more.
 * False until the answer is known, and when it can't be found out.
 */
export function useStageHasQuiz(careerId: string, stageId: string): boolean {
  const { data: roadmap } = useCareerPathwayData(careerId);
  const pathwayId = roadmap.kind === "ready" ? roadmap.pathway.id : null;

  const quizQuery = useQuery({
    queryKey: queryKeys.stageQuiz.questions(pathwayId ?? "", stageId),
    queryFn: () => fetchQuiz(pathwayId as string, stageId),
    enabled: pathwayId !== null,
  });

  return Boolean(quizQuery.data);
}
