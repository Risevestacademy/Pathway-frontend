import clsx from "clsx";
import { Check } from "lucide-react";
import { WEEKDAYS } from "../dashboard.utils";
import { DashCard } from "./DashCard";

export interface Goal {
  id: string;
  label: string;
  /** XP the goal is worth. */
  xp: number;
  done: boolean;
}

/** The week at a glance, then today's goals with what each is worth. */
export function TodaysGoals({
  goals,
  today,
  doneDays,
}: {
  goals: Goal[];
  /** Today's place in the week, Monday as 0. */
  today: number;
  /** Which days of the week had a goal met. */
  doneDays: boolean[];
}) {
  return (
    <DashCard title="Todays Goals" innerClassName="flex flex-col gap-4 bg-surface-muted p-3">
      <ol aria-label="This week" className="flex justify-between gap-1 px-1 pt-2">
        {WEEKDAYS.map((day, index) => {
          const done = doneDays[index] === true;
          const isToday = index === today;
          return (
            <li key={day} className="flex flex-col items-center gap-1.5">
              <span
                className={clsx(
                  "grid size-10 place-items-center rounded-full",
                  done && "bg-brand-500 text-white",
                  !done && isToday && "border-2 border-brand-500 bg-brand-100",
                  !done && !isToday && "bg-grey-100",
                )}
              >
                {done && <Check className="size-5" aria-hidden />}
              </span>
              <span
                aria-current={isToday ? "date" : undefined}
                className={clsx(
                  "text-xs font-medium",
                  isToday ? "text-brand-700" : "text-ink-muted",
                )}
              >
                {day}
                <span className="sr-only">
                  {done ? " goal met" : isToday ? " today" : " no goal met"}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      <ul className="flex flex-col gap-2">
        {goals.map((goal) => (
          <li
            key={goal.id}
            className="flex items-center gap-3 rounded-lg bg-surface px-3 py-3 text-ink"
          >
            <span
              aria-hidden
              className={clsx(
                "grid size-6 shrink-0 place-items-center rounded-full border",
                goal.done ? "border-brand-500 bg-brand-500 text-white" : "border-grey-300 bg-surface",
              )}
            >
              {goal.done && <Check className="size-4" />}
            </span>
            <span className={clsx("flex-1", goal.done && "line-through decoration-ink-muted")}>
              {goal.label}
              <span className="sr-only">{goal.done ? " (done)" : " (not done)"}</span>
            </span>
            <span className="rounded-md bg-brand-100 px-2 py-0.5 text-sm font-medium text-brand-800">
              +{goal.xp} XP
            </span>
          </li>
        ))}
      </ul>
    </DashCard>
  );
}
