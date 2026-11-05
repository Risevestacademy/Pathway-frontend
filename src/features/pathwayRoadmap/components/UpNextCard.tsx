import { useId } from "react";
import { StartStepButton } from "./StartStepButton";

export interface UpNextCardProps {
  careerId: string;
  step: {
    id: string;
    /** The step's place in the pathway, starting at 1. */
    number: number;
    title: string;
    resourceCount: number;
  };
  /** Whether they have already marked any step of this pathway done. */
  started: boolean;
  /**
   * Set when this career isn't their active pathway yet. Starting the step then
   * makes it active first, asking before it replaces another active pathway.
   */
  activation?: { careerTitle: string; activeCareerTitle: string | null };
  /** What the small label above the title says. */
  eyebrow?: string;
  /** Whether to say how many resources the step has. */
  showResources?: boolean;
}

/** The step to do next, and a way into it. */
export function UpNextCard({
  careerId,
  step,
  started,
  activation,
  eyebrow = "Up next",
  showResources = true,
}: UpNextCardProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col items-start gap-4 rounded-3xl border border-brand-100 bg-brand-50 p-6"
    >
      <p className="text-sm font-medium text-brand-700">{eyebrow}</p>

      <div className="flex flex-col gap-1.5">
        <h2 id={headingId} className="font-display text-xl font-medium text-ink">
          Step {step.number} · {step.title}
        </h2>
        {showResources && step.resourceCount > 0 && (
          <p className="text-sm text-ink-muted">
            {step.resourceCount} {step.resourceCount === 1 ? "resource" : "resources"}
          </p>
        )}
      </div>

      <StartStepButton
        careerId={careerId}
        stepNumber={step.number}
        started={started}
        activation={activation}
      />
    </section>
  );
}
