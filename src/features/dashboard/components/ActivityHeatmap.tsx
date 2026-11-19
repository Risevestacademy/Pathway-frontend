import {
  ACTIVITY_DAYS_PER_WEEK,
  ACTIVITY_WEEKS,
  buildMonthLabels,
} from "../activity.utils";

const CELLS = ACTIVITY_WEEKS * ACTIVITY_DAYS_PER_WEEK;

/**
 * A year of days, a week per column. The backend doesn't record activity yet,
 * so every cell is empty; give each cell a level once it does.
 */
export function ActivityHeatmap({ today = new Date() }: { today?: Date }) {
  return (
    <div className="flex flex-col gap-3 overflow-x-auto rounded-3xl border border-line bg-surface p-4">
      <div className="flex min-w-[40rem] flex-col gap-3">
        <div
          role="img"
          aria-label="No activity yet"
          className="grid grid-flow-col grid-rows-7 grid-cols-[repeat(53,minmax(0,1fr))] gap-1"
        >
          {Array.from({ length: CELLS }, (_, index) => (
            <span key={index} data-cell aria-hidden className="aspect-square rounded-[3px] bg-grey-50" />
          ))}
        </div>
        <ol className="flex justify-between text-base text-ink-muted">
          {buildMonthLabels(today).map((month, index) => (
            <li key={`${month}-${index}`}>{month}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
