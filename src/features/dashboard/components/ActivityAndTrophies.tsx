import { CircleHelp, Trophy } from "lucide-react";
import { lastTwelveMonths } from "../dashboard.utils";
import { DashCard } from "./DashCard";

const WEEKS = 53;
const DAYS = 7;
/** The grid is drawn once and only changes when there is activity to show. */
const CELLS = Array.from({ length: WEEKS * DAYS }, (_, index) => index);

/**
 * A year of activity, a square a day. `levels` maps a cell's number (0 is the
 * first day shown) to how much happened; with no activity every square stays empty.
 */
export function ActivityGrid({ levels = {} }: { levels?: Record<number, 1 | 2 | 3> }) {
  const shown = Object.keys(levels).length;
  return (
    <div className="rounded-2xl border border-line p-4">
      <div
        role="img"
        aria-label={
          shown === 0
            ? "Activity over the last 12 months: no activity yet"
            : `Activity over the last 12 months: active on ${shown} days`
        }
        className="grid grid-flow-col gap-1"
        style={{
          gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${DAYS}, auto)`,
        }}
      >
        {CELLS.map((cell) => {
          const level = levels[cell];
          return (
            <span
              key={cell}
              data-level={level ?? 0}
              className={
                level === 3
                  ? "aspect-square rounded-[3px] bg-brand-500"
                  : level === 2
                    ? "aspect-square rounded-[3px] bg-brand-300"
                    : level === 1
                      ? "aspect-square rounded-[3px] bg-brand-100"
                      : "aspect-square rounded-[3px] bg-grey-50"
              }
            />
          );
        })}
      </div>
      <ol aria-hidden className="mt-3 flex justify-between text-sm text-ink-muted">
        {lastTwelveMonths().map((month, index) => (
          <li key={`${month}-${index}`}>{month}</li>
        ))}
      </ol>
    </div>
  );
}

/** Five slots for trophies; the ones not earned yet stay locked. */
export function Trophies({ earned = 0, slots = 5 }: { earned?: number; slots?: number }) {
  return (
    <DashCard title="Trophies" innerClassName="flex flex-col gap-4 px-3 pb-3">
      <p className="flex items-center gap-2 font-display text-2xl font-semibold text-ink">
        <Trophy className="size-5 text-amber-500" aria-hidden />
        <span aria-label={`${earned} trophies earned`}>{earned}</span>
      </p>
      <ul className="flex flex-wrap gap-3">
        {Array.from({ length: slots }, (_, index) => (
          <li
            key={index}
            aria-label={index < earned ? "Earned trophy" : "Locked trophy"}
            className="grid size-14 place-items-center rounded-full bg-grey-50 text-grey-300 shadow-card"
          >
            <CircleHelp className="size-6" aria-hidden />
          </li>
        ))}
      </ul>
    </DashCard>
  );
}
