import clsx from "clsx";
import { Check } from "lucide-react";
import { useId } from "react";
import type { DashboardDto } from "../../../lib/api/dashboard.api";
import { buildWeekStrip } from "../goals.utils";

/** The week at a glance and today's goals. */
export function TodaysGoalsCard({
  goals,
  weekStrip,
  today = new Date(),
}: {
  goals: DashboardDto["goals"];
  weekStrip: DashboardDto["weekStrip"];
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
          {buildWeekStrip(weekStrip.days, today).map((day, index) => (
            <li
              key={`${day.label}-${index}`}
              aria-current={day.isToday ? "date" : undefined}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                aria-hidden
                className={clsx(
                  "grid size-10 place-items-center rounded-full",
                  day.active ? "bg-brand-500 text-white" : "bg-grey-100",
                  day.isToday && (day.active ? "ring-2 ring-brand-200" : "border-2 border-brand-500 bg-brand-100"),
                )}
              >
                {day.active && <Check className="size-5" />}
              </span>
              {day.active && <span className="sr-only">Active</span>}
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

        {goals.length > 0 ? (
          <ul aria-label="Goals" className="flex flex-col gap-2">
            {goals.map((goal) => (
              <li
                key={`${goal.kind}-${goal.id}`}
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
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className={clsx(goal.done ? "text-ink-subtle line-through" : "text-ink")}>
                    {goal.title}
                  </span>
                  {goal.goalDescription && (
                    <span className="text-sm text-ink-muted">{goal.goalDescription}</span>
                  )}
                </span>
                <span className="shrink-0 text-sm font-medium text-brand-ink">+{goal.xp} XP</span>
                {goal.done && <span className="sr-only">Done</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">No goals for today yet.</p>
        )}
      </div>
    </section>
  );
}
