import clsx from "clsx";
import { useId } from "react";
import type { PathwayStepStatus } from "../../../lib/api/progress.api";
import StepCompletionButton from "../../progress/components/StepCompletionButton";
import { useResourceTicks } from "../hooks/useResourceTicks";
import type { ResourceGroup } from "../resourceGroups.utils";
import { STEP_STATUS } from "../stepStatus";
import { ResourceRow } from "./ResourceRow";

/** One step and its resources, with where the step stands when they're tracking this pathway. */
export function ResourceStepCard({
  careerId,
  group,
  status,
  onStepCompleted,
}: {
  careerId: string;
  group: ResourceGroup;
  /** The step's saved status, or null when they aren't tracking this pathway. */
  status: PathwayStepStatus | null;
  /** Called once marking the step complete has been saved. */
  onStepCompleted?: () => void;
}) {
  const headingId = useId();
  const { isTicked, isUnsaved, countTicked, toggle } = useResourceTicks(careerId);

  const count = group.resources.length;
  const ticked = countTicked(group.resources.map((resource) => resource.id));
  const done = status === "COMPLETED";
  const allTicked = count > 0 && ticked === count;
  // Ticking even one resource is enough to offer marking the step complete. A step
  // with nothing to tick can be completed straight away, as nothing else could.
  const hasNothingToTick = count === 0;
  const readyToComplete = status !== null && !done && (ticked > 0 || hasNothingToTick);

  const chip = done
    ? STEP_STATUS.COMPLETED
    : ticked > 0
      ? { label: `${ticked} of ${count} ticked`, chip: "bg-brand-50 text-brand-700" }
      : status
        ? STEP_STATUS[status]
        : null;

  return (
    <section
      aria-labelledby={headingId}
      className={clsx(
        "overflow-hidden rounded-3xl border bg-surface",
        readyToComplete ? "border-brand-300" : "border-line",
      )}
    >
      <header className="flex items-start gap-4 p-6">
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-100 font-medium text-brand-700"
        >
          {group.number}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={headingId} className="font-display text-xl font-medium text-ink">
            Step {group.number} · {group.title}
          </h2>
          <p className="text-sm text-ink-muted">
            {count} {count === 1 ? "resource" : "resources"}
          </p>
        </div>
        {chip && (
          <span className={clsx("rounded-lg px-2 py-0.5 text-sm", chip.chip)}>{chip.label}</span>
        )}
      </header>

      <div className="divide-y divide-line border-t border-line">
        {hasNothingToTick && (
          <p className="px-6 py-5 text-sm text-ink-muted">No resources to tick in this step</p>
        )}
        {group.resources.map((resource) => (
          <ResourceRow
            key={resource.id}
            careerId={careerId}
            resource={resource}
            ticked={isTicked(resource.id)}
            unsaved={isUnsaved(resource.id)}
            onToggle={() => toggle(resource.id)}
          />
        ))}
      </div>

      {(done || readyToComplete) && (
        <footer
          className={clsx(
            "flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-4",
            readyToComplete ? "bg-brand-50" : "bg-surface-muted",
          )}
        >
          {readyToComplete && (
            <p className="text-sm text-ink">
              {hasNothingToTick
                ? "This step has no resources to tick. Mark the step complete when you feel done."
                : allTicked
                  ? "Everything in this step is ticked. Mark the step complete when you feel done."
                  : `You've ticked ${ticked} of ${count} resources. Mark the step complete when you feel done.`}
            </p>
          )}
          <StepCompletionButton
            stepId={group.stepId}
            stepTitle={group.title}
            status={status ?? "NOT_STARTED"}
            variant="primary"
            onCompleted={onStepCompleted}
          />
        </footer>
      )}
    </section>
  );
}
