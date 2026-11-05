import { useQuery } from "@tanstack/react-query";
import { fetchSavedPathways } from "../../../lib/api/progress.api";
import { queryKeys } from "../../../lib/queryKeys";
import { useProgressUserId } from "../../progress/hooks/useCareerProgress";
import type { EarlierPathway } from "../components/EarlierPathwaysCard";

// Short, so a switch made elsewhere shows up on the next visit.
const STALE_MS = 30 * 1000;

/**
 * The pathways the signed-in person saved but isn't on now, apart from the one
 * being looked at: what they could switch back to. Empty until they have loaded,
 * and if they can't be loaded, since this is an extra and not worth an error.
 */
export function useEarlierPathways(careerId: string): EarlierPathway[] {
  const { userId } = useProgressUserId();

  const { data } = useQuery({
    queryKey: queryKeys.progress.saved(userId ?? ""),
    queryFn: fetchSavedPathways,
    enabled: userId !== null,
    staleTime: STALE_MS,
  });

  return (data ?? [])
    .filter((pathway) => !pathway.isActive && pathway.career.id !== careerId && !pathway.career.retired)
    .map(({ career, progress }) => ({
      careerId: career.id,
      title: career.title,
      completed: progress.completed,
      total: progress.total,
    }));
}
