import clsx from "clsx";
import type { DashboardDto } from "../../../lib/api/dashboard.api";
import {
  ACTIVITY_WEEKS,
  buildHeatmapCells,
  buildMonthLabels,
  parseIsoDate,
  type ActivityLevel,
} from "../activity.utils";

const LEVEL_CLASS: Record<ActivityLevel, string> = {
  0: "bg-grey-50",
  1: "bg-brand-200",
  2: "bg-brand-400",
  3: "bg-brand-500",
  4: "bg-brand-700",
};

function describeTotal(total: number): string {
  if (total === 0) return "No activity yet";
  return `${total} ${total === 1 ? "activity" : "activities"} in the last year`;
}

/** A year of days, a week per column, each shaded by how much was done. */
export function ActivityHeatmap({
  heatmap,
  today = new Date(),
}: {
  heatmap: DashboardDto["heatmap"];
  today?: Date;
}) {
  const cells = buildHeatmapCells(heatmap.days);
  const total = heatmap.days.reduce((sum, day) => sum + day.count, 0);
  const end = parseIsoDate(heatmap.to) ?? today;

  return (
    <div className="flex flex-col gap-3 overflow-x-auto rounded-3xl border border-line bg-surface p-4">
      <div className="flex min-w-[40rem] flex-col gap-3">
        <div
          role="img"
          aria-label={describeTotal(total)}
          style={{ gridTemplateColumns: `repeat(${ACTIVITY_WEEKS}, minmax(0, 1fr))` }}
          className="grid grid-flow-col grid-rows-7 gap-1"
        >
          {cells.map((cell, index) => (
            <span
              key={index}
              data-cell
              data-date={cell.date ?? undefined}
              data-level={cell.date ? cell.level : undefined}
              title={cell.date ? `${cell.count} on ${cell.date}` : undefined}
              aria-hidden
              className={clsx("aspect-square rounded-[3px]", LEVEL_CLASS[cell.level])}
            />
          ))}
        </div>
        <ol className="flex justify-between text-base text-ink-muted">
          {buildMonthLabels(end).map((month, index) => (
            <li key={`${month}-${index}`}>{month}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
