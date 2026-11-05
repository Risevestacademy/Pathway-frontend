import clsx from "clsx";
import { useId } from "react";
import type { PathwayStepStatus } from "../../../lib/api/progress.api";
import StepCompletionButton from "../../progress/components/StepCompletionButton";
import ResourceCard from "../../resources/components/ResourceCard";
import type { ResourceGroup } from "../resourceGroups.utils";
import { STEP_STATUS } from "../stepStatus";

/** One step and its resources, with where the step stands when they're tracking this pathway. */
export function ResourceStepCard({
  careerId,
  careerTitle,
  group,
  status,
}: {
  careerId: string;
  careerTitle: string;
  group: ResourceGroup;
  /** The step's saved status, or null when they aren't tracking this pathway. */
  status: PathwayStepStatus | null;
}) {
  const headingId = useId();
  const title = `Step ${group.number} · ${group.title}`;
  const count = group.resources.length;

  return (
    <section
      aria-labelledby={headingId}
      className="overflow-hidden rounded-3xl border border-line bg-surface"
    >
      <header className="flex items-start gap-4 border-b border-line p-6">
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-100 font-medium text-brand-700"
        >
          {group.number}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={headingId} className="font-display text-xl font-medium text-ink">
            {title}
          </h2>
          <p className="text-ink-muted">
            {count} {count === 1 ? "resource" : "resources"}
          </p>
        </div>
        {status && (
          <span className={clsx("rounded-lg px-2 py-0.5 text-sm", STEP_STATUS[status].chip)}>
            {STEP_STATUS[status].label}
          </span>
        )}
      </header>

      <div className="flex flex-col gap-4 p-6">
        {group.resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            context={{ careerId, careerTitle, stepTitle: group.title }}
          />
        ))}
      </div>

      {status && (
        <footer className="border-t border-line bg-surface-muted px-6 py-4">
          <StepCompletionButton stepId={group.stepId} stepTitle={group.title} status={status} />
        </footer>
      )}
    </section>
  );
}
