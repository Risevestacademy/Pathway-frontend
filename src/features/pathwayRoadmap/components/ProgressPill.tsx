/** A small pill in the top bar: how far through their pathway they are. */
export function ProgressPill({ completed, total }: { completed: number; total: number }) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="hidden items-center gap-3 rounded-lg border border-grey-50 bg-surface px-3 py-2 text-sm text-ink-muted shadow-card lg:flex">
      <span>{percentage}%</span>
      <div
        role="progressbar"
        aria-label="Pathway progress"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={completed}
        className="h-1.5 w-40 overflow-hidden rounded-pill bg-grey-100 xl:w-64"
      >
        <div
          style={{ width: `${percentage}%` }}
          className="h-full rounded-pill bg-accent-500 transition-[width] duration-500 ease-out motion-reduce:transition-none"
        />
      </div>
      <span className="whitespace-nowrap">
        {completed} of {total} {total === 1 ? "step" : "steps"}
      </span>
    </div>
  );
}
