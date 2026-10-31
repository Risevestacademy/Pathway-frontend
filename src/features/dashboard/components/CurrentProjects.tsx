import type { ReactNode } from "react";
import { clampPercentage } from "../dashboard.utils";
import { DashCard } from "./DashCard";

/** What the card is about now: the next piece of the pathway, with where the pathway stands. */
export interface CurrentProject {
  title: string;
  description: string;
  /** e.g. "HTML • CSS • LAYOUTS". */
  tags: string;
  pathwayTitle: string;
  percentage: number;
}

/** The current piece of work, how far along its pathway is, and a way to carry on. */
export function CurrentProjects({
  project,
  moreCount,
  action,
  empty,
}: {
  project: CurrentProject | null;
  /** How many other saved pathways there are. */
  moreCount: number;
  /** The "Continue" link, or why there isn't one. */
  action: ReactNode;
  /** Shown when there is nothing to carry on with. */
  empty: ReactNode;
}) {
  return (
    <DashCard title="Current Projects" innerClassName="flex flex-col gap-3">
      {project ? (
        <div className="flex flex-col gap-3 rounded-xl bg-surface-muted p-5">
          <h3 className="font-display text-xl font-semibold text-ink">{project.title}</h3>
          {project.description && <p className="text-ink">{project.description}</p>}
          {project.tags && <p className="text-sm tracking-wide text-ink-muted">{project.tags}</p>}
          <div
            role="progressbar"
            aria-label={`${project.pathwayTitle} progress`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={clampPercentage(project.percentage)}
            className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-grey-100"
          >
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${clampPercentage(project.percentage)}%` }}
            />
          </div>
          <div className="flex items-center justify-between gap-3 text-ink">
            <p>{project.pathwayTitle}</p>
            <p className="font-medium">{clampPercentage(project.percentage)}%</p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-surface-muted p-5 text-ink-muted">{empty}</div>
      )}

      <div className="mt-auto grid gap-3 sm:grid-cols-[1fr_1.2fr]">
        <p className="rounded-xl bg-surface-muted px-4 py-3 text-ink">{moreCount} more</p>
        {action}
      </div>
    </DashCard>
  );
}
