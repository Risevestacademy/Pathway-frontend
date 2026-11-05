import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useAuthStore } from "../../../lib/stores/authStore";
import {
  readTicks,
  readUnsaved,
  resourceTicksKey,
  retrySave,
  subscribeResourceTicks,
  toggleTick,
} from "../resourceTicks.store";

const EMPTY = JSON.stringify({ ticked: [], unsaved: [] });

/** The resources the signed-in person has ticked as done in this career's pathway, saved in this browser. */
export function useResourceTicks(careerId: string) {
  const userId = useAuthStore((state) => state.user?.id ?? "");
  const key = resourceTicksKey(userId, careerId);

  // A string, so React sees a change only when the ticks really change.
  const snapshot = useSyncExternalStore(
    subscribeResourceTicks,
    () => JSON.stringify({ ticked: readTicks(key), unsaved: readUnsaved(key) }),
    () => EMPTY,
  );
  const { ticked, unsaved } = useMemo(() => {
    const parsed = JSON.parse(snapshot) as { ticked: string[]; unsaved: string[] };
    return { ticked: new Set(parsed.ticked), unsaved: parsed.unsaved };
  }, [snapshot]);

  const isTicked = useCallback((resourceId: string) => ticked.has(resourceId), [ticked]);
  const isUnsaved = useCallback((resourceId: string) => unsaved.includes(resourceId), [unsaved]);
  const countTicked = useCallback(
    (resourceIds: string[]) => resourceIds.filter((id) => ticked.has(id)).length,
    [ticked],
  );
  const toggle = useCallback((resourceId: string) => toggleTick(key, resourceId), [key]);
  /** Tries again to save the ticks the browser refused. True once they are saved. */
  const retry = useCallback(() => retrySave(key), [key]);

  return { isTicked, isUnsaved, countTicked, toggle, retry, unsaved };
}
