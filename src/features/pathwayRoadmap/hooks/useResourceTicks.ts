import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { fetchPathwayOrNull, setResourceCompletion } from "../../../lib/api/pathways.api";
import { fetchPathwayResources, type PathwayResourcesDto } from "../../../lib/api/pathwayResources.api";
import { queryKeys } from "../../../lib/queryKeys";
import { useAuthStore } from "../../../lib/stores/authStore";
import { applyResourceCompletion, completedResourceIds } from "../resourceCompletion.utils";
import {
  markUnsaved,
  readDesired,
  readUnsaved,
  resourceTicksKey,
  setDesired,
  settleTick,
  subscribeResourceTicks,
} from "../resourceTicks.store";

const PATHWAY_STALE_MS = 15 * 60 * 1000;
const EMPTY = JSON.stringify({ desired: {}, unsaved: [] });

/**
 * The resources the signed-in person has ticked as done in this career's
 * pathway. The server holds the truth; a tick shows at once and is saved in
 * the background, and one that fails to save stays ticked for now, named as not
 * saved, until it is retried.
 */
export function useResourceTicks(careerId: string) {
  const userId = useAuthStore((state) => state.user?.id ?? "");
  const queryClient = useQueryClient();

  // Shares the roadmap's cache entry, so this adds no request of its own.
  const pathwayQuery = useQuery({
    queryKey: queryKeys.pathway(careerId),
    queryFn: () => fetchPathwayOrNull(careerId),
    staleTime: PATHWAY_STALE_MS,
    refetchOnWindowFocus: false,
  });
  const pathwayId = pathwayQuery.data?.id ?? null;

  const resourcesKey = queryKeys.pathwayResources(userId, pathwayId ?? "");
  const resourcesQuery = useQuery({
    queryKey: resourcesKey,
    queryFn: () => fetchPathwayResources(pathwayId as string),
    enabled: pathwayId !== null && userId !== "",
  });

  const key = resourceTicksKey(userId, pathwayId ?? "");
  // A string, so React sees a change only when something really changes.
  const snapshot = useSyncExternalStore(
    subscribeResourceTicks,
    () => JSON.stringify({ desired: readDesired(key), unsaved: readUnsaved(key) }),
    () => EMPTY,
  );
  const { desired, unsaved } = useMemo(
    () => JSON.parse(snapshot) as { desired: Record<string, boolean>; unsaved: string[] },
    [snapshot],
  );

  const done = useMemo(() => completedResourceIds(resourcesQuery.data), [resourcesQuery.data]);

  const isTicked = useCallback((resourceId: string) => desired[resourceId] ?? done.has(resourceId), [desired, done]);
  const isUnsaved = useCallback((resourceId: string) => unsaved.includes(resourceId), [unsaved]);
  const countTicked = useCallback(
    (resourceIds: string[]) => resourceIds.filter(isTicked).length,
    [isTicked],
  );

  const save = useCallback(
    (resourceId: string, ticked: boolean) => {
      if (!pathwayId) return;
      setResourceCompletion(pathwayId, resourceId, ticked).then(
        (response) => {
          queryClient.setQueryData<PathwayResourcesDto>(resourcesKey, (data) =>
            applyResourceCompletion(data, response),
          );
          settleTick(key, resourceId);
        },
        () => markUnsaved(key, resourceId),
      );
    },
    [pathwayId, queryClient, resourcesKey, key],
  );

  const toggle = useCallback(
    (resourceId: string) => {
      if (!pathwayId) return;
      const next = !isTicked(resourceId);
      setDesired(key, resourceId, next);
      save(resourceId, next);
    },
    [pathwayId, isTicked, key, save],
  );

  /** Tries again to save the ticks that failed, each as it was last wanted. */
  const retry = useCallback(() => {
    for (const resourceId of unsaved) {
      const wanted = desired[resourceId];
      if (wanted !== undefined) save(resourceId, wanted);
    }
  }, [unsaved, desired, save]);

  return { isTicked, isUnsaved, countTicked, toggle, retry, unsaved };
}
