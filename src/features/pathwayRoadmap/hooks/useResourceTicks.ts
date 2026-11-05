import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useAuthStore } from "../../../lib/stores/authStore";
import {
  readTicks,
  resourceTicksKey,
  subscribeResourceTicks,
  toggleTick,
} from "../resourceTicks.store";

/** The resources the signed-in person has ticked as done in this career's pathway, saved in this browser. */
export function useResourceTicks(careerId: string) {
  const userId = useAuthStore((state) => state.user?.id ?? "");
  const key = resourceTicksKey(userId, careerId);

  // A string, so React sees a change only when the ticks really change.
  const snapshot = useSyncExternalStore(
    subscribeResourceTicks,
    () => JSON.stringify(readTicks(key)),
    () => "[]",
  );
  const ticked = useMemo(() => new Set<string>(JSON.parse(snapshot) as string[]), [snapshot]);

  const isTicked = useCallback((resourceId: string) => ticked.has(resourceId), [ticked]);
  const countTicked = useCallback(
    (resourceIds: string[]) => resourceIds.filter((id) => ticked.has(id)).length,
    [ticked],
  );
  const toggle = useCallback((resourceId: string) => toggleTick(key, resourceId), [key]);

  return { isTicked, countTicked, toggle };
}
