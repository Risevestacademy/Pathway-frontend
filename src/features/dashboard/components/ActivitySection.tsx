import type { DashboardDto } from "../../../lib/api/dashboard.api";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { TrophiesCard } from "./TrophiesCard";

/** The year at a glance, with trophies beside it. */
export function ActivitySection({
  dashboard,
}: {
  dashboard: Pick<DashboardDto, "heatmap" | "badges" | "totals">;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-medium text-ink">Activity</h2>
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <ActivityHeatmap heatmap={dashboard.heatmap} />
        <TrophiesCard
          badges={dashboard.badges}
          earned={dashboard.totals.badgesEarned}
          total={dashboard.totals.badgesTotal}
        />
      </div>
    </section>
  );
}
