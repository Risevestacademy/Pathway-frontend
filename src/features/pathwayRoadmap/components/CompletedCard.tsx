import clsx from "clsx";
import { Check } from "lucide-react";
import { useId, useState } from "react";
import { Link } from "@tanstack/react-router";
import StepCompletionButton from "../../progress/components/StepCompletionButton";

export interface CompletedStep {
  id: string;
  /** The step's place in the pathway, starting at 1. */
  number: number;
  title: string;
}

export interface TickedResource {
  id: string;
  title: string;
  step: { number: number; title: string };
}

type Tab = "steps" | "resources";

const tick = (
  <span
    aria-hidden
    className="grid size-6 shrink-0 place-items-center rounded-md bg-brand-600 text-white"
  >
    <Check className="size-4" />
  </span>
);

/** What they have marked complete: the steps, and the resources they have ticked. */
export function CompletedCard({
  careerId,
  steps,
  resources,
}: {
  careerId: string;
  steps: CompletedStep[];
  resources: TickedResource[];
}) {
  const headingId = useId();
  const [tab, setTab] = useState<Tab>("steps");

  const tabClass = (current: boolean) =>
    clsx(
      "focus-ring cursor-pointer rounded-lg px-3 py-1.5 text-sm transition-colors duration-200 ease-out motion-reduce:transition-none",
      current ? "bg-surface font-medium text-ink shadow-card" : "text-ink-muted hover:text-ink",
    );

  return (
    <section
      aria-labelledby={headingId}
      className="overflow-hidden rounded-3xl border border-line bg-surface"
    >
      <header className="flex flex-wrap items-center gap-4 p-6">
        <h2 id={headingId} className="font-display text-xl font-medium text-ink">
          Completed
        </h2>
        <div role="tablist" aria-label="What to list" className="flex gap-1 rounded-xl bg-grey-50 p-1">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "steps"}
            onClick={() => setTab("steps")}
            className={tabClass(tab === "steps")}
          >
            Steps
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "resources"}
            onClick={() => setTab("resources")}
            className={tabClass(tab === "resources")}
          >
            Resources
          </button>
        </div>
      </header>

      <div role="tabpanel" className="border-t border-line">
        {tab === "steps" ? (
          steps.length === 0 ? (
            <p className="p-6 text-sm text-ink-muted">No steps marked complete yet</p>
          ) : (
            <ul className="divide-y divide-line">
              {steps.map((step) => (
                <li key={step.id} className="flex items-center gap-4 px-6 py-4">
                  {tick}
                  <p className="min-w-0 flex-1 font-display text-base font-medium text-ink">
                    Step {step.number} · {step.title}
                  </p>
                  <StepCompletionButton
                    stepId={step.id}
                    stepTitle={step.title}
                    status="COMPLETED"
                    variant="undo"
                  />
                </li>
              ))}
            </ul>
          )
        ) : resources.length === 0 ? (
          <p className="p-6 text-sm text-ink-muted">No resources ticked yet</p>
        ) : (
          <ul className="divide-y divide-line">
            {resources.map((resource) => (
              <li key={resource.id} className="flex items-center gap-4 px-6 py-4">
                {tick}
                <div className="min-w-0 flex-1">
                  <Link
                    to="/my-pathway/$careerId/resources/$resourceId"
                    params={{ careerId, resourceId: resource.id }}
                    className="focus-ring rounded font-display text-base font-medium text-ink hover:underline"
                  >
                    {resource.title}
                  </Link>
                  <p className="text-sm text-ink-muted">
                    Step {resource.step.number} · {resource.step.title}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
