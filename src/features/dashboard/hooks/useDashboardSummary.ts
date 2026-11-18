import { buildDashboardSummary, type DashboardSummary } from "../dashboard.utils";
import { useDashboard } from "./useDashboard";

export type DashboardSummaryState =
  | { kind: "loading" }
  | { kind: "signed-out" }
  | { kind: "error" }
  | { kind: "ready"; summary: DashboardSummary };

/** The numbers the stat and progress cards show, from the one dashboard request. */
export function useDashboardSummary(): { state: DashboardSummaryState; retry: () => void } {
  const { state, retry } = useDashboard();

  if (state.kind === "ready") {
    return { state: { kind: "ready", summary: buildDashboardSummary(state.dashboard) }, retry };
  }
  return { state, retry };
}
