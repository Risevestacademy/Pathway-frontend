import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activateOnServer } from "./activePathwaySync";
import { useActiveCareerId } from "./useSkillCheck";

/**
 * Catches the server up with a pathway begun in My Pathway before My Pathway
 * told the server about them. When the server has no saved pathway
 * (`serverHasNone`) but My Pathway has an active one, that one is saved to the
 * server, once. If it can't be (no match in the catalogue, or the server
 * refuses), nothing changes and the person can still pick one from there.
 *
 * `syncing` is true while that is happening, so a screen can wait instead of
 * showing "nothing saved" for a moment.
 */
export function useSyncLocalActivePathway(serverHasNone: boolean): { syncing: boolean } {
  const queryClient = useQueryClient();
  const localActiveId = useActiveCareerId().data ?? null;
  const tried = useRef(false);
  const sync = useMutation({
    mutationFn: (careerId: string) => activateOnServer(queryClient, careerId),
  });
  const { mutate } = sync;

  useEffect(() => {
    if (!serverHasNone || !localActiveId || tried.current) return;
    tried.current = true;
    mutate(localActiveId);
  }, [serverHasNone, localActiveId, mutate]);

  return { syncing: sync.isPending };
}
