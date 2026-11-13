import { useId } from "react";
import { LinkButton } from "../../../components/ui/Button";

/**
 * Projects have no backend yet, so this is always the empty state.
 * Swap the body for a project list once an endpoint exists.
 */
export function CurrentProjectsCard() {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-2"
    >
      <h2 id={headingId} className="px-4 pt-3 text-base font-medium text-ink-muted">
        Current Projects
      </h2>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl bg-grey-50 px-6 py-10 text-center">
        <h3 className="font-display text-xl font-medium text-ink">No projects yet</h3>
        <p className="max-w-md text-sm text-ink-muted">
          Projects show up when you start a pathway. Each one is a small build you can do on your
          own, with a brief to follow.
        </p>
        <LinkButton to="/careers" isPrimary={false}>
          Explore careers
        </LinkButton>
      </div>
    </section>
  );
}
