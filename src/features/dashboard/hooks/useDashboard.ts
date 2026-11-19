import { useQuery } from "@tanstack/react-query";
import { fetchDashboard, type DashboardDto } from "../../../lib/api/dashboard.api";
import { queryKeys } from "../../../lib/queryKeys";
import { retryUnlessClientError } from "../../../lib/queryRetry";
import { useProgressUserId } from "../../progress/hooks/useCareerProgress";

// Short, so a change made on the other client shows up on the next visit.
const STALE_MS = 30 * 1000;

export type DashboardState =
  | { kind: "loading" }
  | { kind: "signed-out" }
  | { kind: "error" }
  | { kind: "ready"; dashboard: DashboardDto };

/**
 * The signed-in person's dashboard, from one request.
 *
 * The query sits under the progress keys, so toggling a step refetches it. While that runs the
 * last snapshot stays on screen, and a failed refresh keeps it too, so the page never flashes a
 * loading or error state after the first load.
 */
export function useDashboard(): { state: DashboardState; retry: () => void } {
  const { userId, isHydrating } = useProgressUserId();

  const query = useQuery({
    queryKey: queryKeys.progress.dashboard(userId ?? ""),
    queryFn: fetchDashboard,
    enabled: userId !== null,
    staleTime: STALE_MS,
    retry: retryUnlessClientError,
  });

  const retry = () => {
    void query.refetch();
  };

  if (userId === null) {
    return { state: { kind: isHydrating ? "loading" : "signed-out" }, retry };
  }
  if (query.data) {
    return { state: { kind: "ready", dashboard: query.data }, retry };
  }
  if (query.isError) {
    return { state: { kind: "error" }, retry };
  }
  return { state: { kind: "loading" }, retry };
}
