import clsx from "clsx";
import { useId } from "react";
import { Link } from "@tanstack/react-router";
import type { PathwayStepStatus } from "../../../lib/api/progress.api";
import { STEP_STATUS } from "../stepStatus";

export interface RoadmapStepRow {
  id: string;
  /** The step's place in the pathway, starting at 1. */
  number: number;
  title: string;
  description: string;
  status: PathwayStepStatus;
}

/** Every step of the pathway in order, with where each one stands. */
export function YourRoadmapCard({
  careerId,
  steps,
  nextStepId,
}: {
  careerId: string;
  steps: RoadmapStepRow[];
  /** The step to do next, highlighted, or null when there isn't one. */
  nextStepId: string | null;
}) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="overflow-hidden rounded-3xl border border-line bg-surface"
    >
      <div className="border-b border-line p-6">
        <h2 id={headingId} className="font-display text-xl font-medium text-ink">
          Your roadmap
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Do the steps in order. Later steps build on earlier ones, but you can look ahead.
        </p>
      </div>

      {steps.length === 0 ? (
        <p className="text-sm p-6 text-ink-muted">This roadmap has no steps yet</p>
      ) : (
        <ol className="divide-y divide-line">
          {steps.map((step) => {
            const isNext = step.id === nextStepId;
            const status = STEP_STATUS[step.status];
            return (
              <li
                key={step.id}
                aria-current={isNext ? "step" : undefined}
                className={clsx("flex items-start gap-4 px-6 py-5", isNext && "bg-brand-50")}
              >
                <span
                  aria-hidden
                  className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-100 font-medium text-brand-700"
                >
                  {step.number}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      to="/careers/$careerId/roadmap/$stepId"
                      params={{ careerId, stepId: step.id }}
                      className="focus-ring rounded font-display text-base font-medium text-ink hover:underline"
                    >
                      {step.title}
                    </Link>
                    <span className={clsx("rounded-lg px-2 py-0.5 text-sm", status.chip)}>
                      {status.label}
                    </span>
                    {isNext && <span className="sr-only">(up next)</span>}
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
