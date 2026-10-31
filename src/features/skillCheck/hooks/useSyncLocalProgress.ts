import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { ActivePathway } from "../../progress/progress.types";
import { syncLocalProgress } from "./activePathwaySync";
import { useActiveCareerId, useSkillCheckUserId } from "./useSkillCheck";

/**
 * Catches the server up with the step a person starts from, and the steps they
 * marked done, in a pathway begun in My Pathway before My Pathway told the
 * server about them. Without it the dashboard would point at the first step
 * while My Pathway says "up next: step 3".
 *
 * It runs in the background once per pathway, once the server's active pathway
 * is known, and only sends what the server is missing. A failure leaves things
 * as they were; the dashboard simply keeps showing what the server has.
 */
export function useSyncLocalProgress(active: ActivePathway | undefined): void {
  const queryClient = useQueryClient();
  const userId = useSkillCheckUserId();
  const localActiveId = useActiveCareerId().data ?? null;
  const doneFor = useRef<string | null>(null);

  useEffect(() => {
    const serverCareerId = active?.career?.id;
    if (!active || !serverCareerId || !localActiveId) return;

    const key = `${localActiveId}:${serverCareerId}`;
    if (doneFor.current === key) return;
    doneFor.current = key;

    void syncLocalProgress(queryClient, userId, localActiveId, active).catch(() => {
      // A background catch-up: nothing to tell the person if it can't finish.
    });
  }, [active, localActiveId, queryClient, userId]);
}
