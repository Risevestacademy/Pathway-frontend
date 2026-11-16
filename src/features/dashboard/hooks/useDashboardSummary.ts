import { isAxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { fetchActivePathway, fetchSavedPathways } from "../../../lib/api/progress.api";
import { queryKeys } from "../../../lib/queryKeys";
import { retryUnlessClientError } from "../../../lib/queryRetry";
import { useProgressUserId } from "../../progress/hooks/useCareerProgress";
import {
  NO_ACTIVE_PATHWAY,
  buildDashboardSummary,
  type DashboardSummary,
} from "../dashboard.utils";

// Short, so a change made on the other client shows up on the next visit.
const STALE_MS = 30 * 1000;

export type DashboardSummaryState =
  | { kind: "loading" }
  | { kind: "signed-out" }
  | { kind: "error" }
  | { kind: "ready"; summary: DashboardSummary };

// The backend doesn't document what someone with no pathway gets, so a 404 counts as "none yet".
async function fetchActiveOrNone() {
  try {
    return await fetchActivePathway();
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return NO_ACTIVE_PATHWAY;
    throw error;
  }
}

/** The signed-in person's dashboard numbers, from their active and saved pathways. */
export function useDashboardSummary(): { state: DashboardSummaryState; retry: () => void } {
  const { userId, isHydrating } = useProgressUserId();

  const activeQuery = useQuery({
    queryKey: queryKeys.progress.active(userId ?? ""),
    queryFn: fetchActiveOrNone,
    enabled: userId !== null,
    staleTime: STALE_MS,
    retry: retryUnlessClientError,
  });
  const savedQuery = useQuery({
    queryKey: queryKeys.progress.saved(userId ?? ""),
    queryFn: fetchSavedPathways,
    enabled: userId !== null,
    staleTime: STALE_MS,
    retry: retryUnlessClientError,
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
  if (!activeQuery.data || !savedQuery.data) {
    return { state: { kind: "loading" }, retry };
  }

  return {
    state: { kind: "ready", summary: buildDashboardSummary(activeQuery.data, savedQuery.data) },
    retry,
  };
}
