import { useId } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LinkButton } from "../../../components/ui/Button";
import StartTrackingButton from "../../progress/components/StartTrackingButton";

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
}

/** The step to do next, and a way into it. */
export function UpNextCard({ careerId, step, started, activation }: UpNextCardProps) {
  const headingId = useId();
  const navigate = useNavigate();
  const label = `${started ? "Continue" : "Start"} step ${step.number}`;
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col items-start gap-4 rounded-3xl border border-brand-100 bg-brand-50 p-6"
    >
      <p className="text-base text-brand-700">Up next</p>

      <div className="flex flex-col gap-1.5">
        <h2 id={headingId} className="font-display text-2xl font-medium text-ink">
          Step {step.number} · {step.title}
        </h2>
        {step.resourceCount > 0 && (
          <p className="text-ink-muted">
            {step.resourceCount} {step.resourceCount === 1 ? "resource" : "resources"}
          </p>
        )}
      </div>

      {activation ? (
        <StartTrackingButton
          careerId={careerId}
          careerTitle={activation.careerTitle}
          activeCareerTitle={activation.activeCareerTitle}
          label={label}
          onStarted={() =>
            void navigate({ to: "/my-pathway/$careerId/resources", params: { careerId } })
          }
        />
      ) : (
        <LinkButton to="/my-pathway/$careerId/resources" params={{ careerId }}>
          {label}
        </LinkButton>
      )}
    </section>
  );
}
