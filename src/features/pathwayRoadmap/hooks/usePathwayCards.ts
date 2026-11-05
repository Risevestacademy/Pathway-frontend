import { useQueries, useQuery } from "@tanstack/react-query";
import { fetchPathwayOrNull } from "../../../lib/api/pathways.api";
import { fetchActivePathway, fetchSavedPathways } from "../../../lib/api/progress.api";
import { queryKeys } from "../../../lib/queryKeys";
import { useProgressUserId } from "../../progress/hooks/useCareerProgress";
import type { PathwayCardProps } from "../components/PathwayCard";
import { buildPathwayCards } from "../pathwayCards.utils";

// Short, so a change made on the other client shows up on the next visit.
const PROGRESS_STALE_MS = 30 * 1000;
const ROADMAP_STALE_MS = 15 * 60 * 1000;

export type PathwayCardsState =
  | { kind: "loading" }
  | { kind: "signed-out" }
  | { kind: "error" }
  | { kind: "ready"; cards: PathwayCardProps[] };

/** The signed-in person's saved pathways, as cards: the active one first. */
export function usePathwayCards(): { state: PathwayCardsState; retry: () => void } {
  const { userId, isHydrating } = useProgressUserId();

  const activeQuery = useQuery({
    queryKey: queryKeys.progress.active(userId ?? ""),
    queryFn: fetchActivePathway,
    enabled: userId !== null,
    staleTime: PROGRESS_STALE_MS,
  });
  const savedQuery = useQuery({
    queryKey: queryKeys.progress.saved(userId ?? ""),
    queryFn: fetchSavedPathways,
    enabled: userId !== null,
    staleTime: PROGRESS_STALE_MS,
  });

  const saved = savedQuery.data;
  // Each saved career's roadmap, for the text under "Currently at".
  const roadmaps = useQueries({
    queries: (saved ?? []).map(({ career }) => ({
      queryKey: queryKeys.pathway(career.id),
      queryFn: () => fetchPathwayOrNull(career.id),
      staleTime: ROADMAP_STALE_MS,
      refetchOnWindowFocus: false,
    })),
  });

  const retry = () => {
    void activeQuery.refetch();
    void savedQuery.refetch();
  };

  if (userId === null) {
    return { state: { kind: isHydrating ? "loading" : "signed-out" }, retry };
  }
  if (activeQuery.isError || savedQuery.isError) {
    return { state: { kind: "error" }, retry };
  }
  // Wait for the roadmaps, so the text under each card doesn't pop in later.
  if (!activeQuery.data || !saved || roadmaps.some((roadmap) => roadmap.isPending)) {
    return { state: { kind: "loading" }, retry };
  }

  // A roadmap that couldn't load leaves its card without a description.
  const pathways = Object.fromEntries(
    saved.map(({ career }, index) => [career.id, roadmaps[index]?.data]),
  );

  return {
    state: {
      kind: "ready",
      cards: buildPathwayCards({ saved, active: activeQuery.data, pathways }),
    },
    retry,
  };
}
