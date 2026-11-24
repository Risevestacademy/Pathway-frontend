import type { DashboardDto } from "../../../lib/api/dashboard.api";
import { buildDashboardSummary, type DashboardSummary } from "../dashboard.utils";
import { useDashboard } from "./useDashboard";

export type DashboardSummaryState =
  | { kind: "loading" }
  | { kind: "signed-out" }
  | { kind: "error" }
  | { kind: "ready"; summary: DashboardSummary; dashboard: DashboardDto };

/** The dashboard request, with the numbers the stat and progress cards show worked out from it. */
export function useDashboardSummary(): { state: DashboardSummaryState; retry: () => void } {
  const { state, retry } = useDashboard();

  if (state.kind === "ready") {
    return {
      state: {
        kind: "ready",
        summary: buildDashboardSummary(state.dashboard),
        dashboard: state.dashboard,
      },
      retry,
    };
  }
  return { state, retry };
}
