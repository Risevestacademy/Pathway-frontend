import { useId } from "react";
import ProgressBar from "../../progress/components/ProgressBar";
import { describeProgress } from "../../progress/progress.utils";

/** How many steps of the pathway the person has marked complete. */
export function OverallProgressCard({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-6"
    >
      <div className="flex flex-wrap items-center gap-3">
        <h2 id={headingId} className="font-display text-xl font-medium text-ink">
          Overall progress
        </h2>
        <span className="rounded-lg bg-grey-100 px-2.5 py-1 text-sm text-ink-muted">
          Self-reported
        </span>
      </div>

      <p className="font-display text-xl font-medium text-ink">
        {describeProgress(completed, total)}
      </p>

      <ProgressBar completed={completed} total={total} label="Overall progress" />

      <p className="text-sm text-ink-muted">
        Progress counts the steps you mark complete. We do not check that you finished them.
      </p>
    </section>
  );
}
