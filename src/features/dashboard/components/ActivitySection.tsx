import { ActivityHeatmap } from "./ActivityHeatmap";
import { TrophiesCard } from "./TrophiesCard";

/** The year at a glance, with trophies beside it. */
export function ActivitySection() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-medium text-ink">Activity</h2>
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <ActivityHeatmap />
        <TrophiesCard />
      </div>
    </section>
  );
}
