import clsx from "clsx";
import { Check } from "lucide-react";
import { useId } from "react";
import type { DashboardSummary } from "../dashboard.utils";
import { buildTodaysGoals, buildWeek } from "../goals.utils";

/** The week at a glance and a short list of first steps. */
export function TodaysGoalsCard({
  summary,
  today = new Date(),
}: {
  summary: DashboardSummary;
  today?: Date;
}) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-2"
    >
      <h2 id={headingId} className="px-4 pt-3 text-base font-medium text-ink-muted">
        Today&apos;s Goals
      </h2>
      <div className="flex flex-col gap-4 rounded-2xl bg-grey-50 p-4">
        <ol aria-label="This week" className="flex justify-between gap-2">
          {buildWeek(today).map((day) => (
            <li
              key={day.label}
              aria-current={day.isToday ? "date" : undefined}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                aria-hidden
                className={clsx(
                  "size-10 rounded-full",
                  day.isToday ? "border-2 border-brand-500 bg-brand-100" : "bg-grey-100",
                )}
              />
              <span
                className={clsx(
                  "text-xs",
                  day.isToday ? "font-medium text-brand-ink" : "text-ink-subtle",
                )}
              >
                {day.label}
              </span>
            </li>
          ))}
        </ol>

        <ul aria-label="Goals" className="flex flex-col gap-2">
          {buildTodaysGoals(summary).map((goal) => (
            <li
              key={goal.id}
              className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3 text-base"
            >
              <span
                aria-hidden
                className={clsx(
                  "grid size-6 shrink-0 place-items-center rounded-full border",
                  goal.done
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-grey-200 bg-surface",
                )}
              >
                {goal.done && <Check className="size-4" />}
              </span>
              <span className={clsx(goal.done ? "text-ink-subtle line-through" : "text-ink")}>
                {goal.title}
              </span>
              {goal.done && <span className="sr-only">Done</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
