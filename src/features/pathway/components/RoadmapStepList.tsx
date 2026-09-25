import { Link } from "@tanstack/react-router";
import { ChevronRight, Lock } from "lucide-react";
import type { RoadmapStep } from "../pathway.types";
import StepEstimate from "./StepEstimate";

type RoadmapStepListProps = {
  careerId: string;
  steps: RoadmapStep[];
};

export default function RoadmapStepList({
  careerId,
  steps,
}: RoadmapStepListProps) {
  const numberOf = (stepId: string) =>
    steps.findIndex((s) => s.stepId === stepId) + 1;

  return (
    <ol
      className="
        relative mt-8 grid gap-4
        before:absolute before:top-4 before:bottom-4 before:left-[19px]
        before:w-0.5 before:bg-line
        md:before:left-[23px]
      "
    >
      {steps.map((step, index) => (
        <li key={step.stepId} className="relative flex gap-4">
          <span
            aria-hidden
            className="
              relative z-10 grid size-10 shrink-0 place-items-center
              rounded-pill border-2 border-brand-600 bg-surface
              font-display font-semibold text-brand-700
              md:size-12
            "
          >
            {index + 1}
          </span>

          <Link
            to="/careers/$careerId/roadmap/$stepId"
            params={{ careerId, stepId: step.stepId }}
            className="group flex-1 rounded-lg focus-visible:outline-2 focus-visible:outline-brand-600"
          >
            <div
              className="
                flex items-start gap-3
                rounded-lg border border-line bg-surface p-4 shadow-card
                transition-shadow group-hover:shadow-raised
                md:p-5
              "
            >
              <div className="flex-1">
                <h2 className="font-display font-semibold text-ink">
                  <span className="sr-only">Step {index + 1}: </span>
                  {step.title}
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  {step.learningObjective}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 empty:hidden">
                  <StepEstimate estimate={step.estimate} compact />
                  {step.requiredPrerequisiteStepId && (
                    <span
                      className="
                        inline-flex items-center gap-1
                        rounded-pill bg-warning-50 px-2 py-0.5
                        text-xs font-medium whitespace-nowrap text-warning-700
                      "
                    >
                      <Lock className="size-3" aria-hidden />
                      Requires step {numberOf(step.requiredPrerequisiteStepId)}{" "}
                      first
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight
                aria-hidden
                className="mt-1 size-5 shrink-0 text-ink-subtle group-hover:text-ink"
              />
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}
