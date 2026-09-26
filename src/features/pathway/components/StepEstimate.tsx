import { Clock } from "lucide-react";
import type { TimeEstimate } from "../pathway.types";
import { describeEstimate } from "../pathway.utils";

type StepEstimateProps = {
  estimate?: TimeEstimate;
  compact?: boolean;
};

export default function StepEstimate({ estimate, compact }: StepEstimateProps) {
  const described = describeEstimate(estimate);
  if (!described) return null;

  if (compact) {
    return (
      <span className="inline-flex items-start gap-1 text-xs text-ink-muted">
        <Clock className="mt-px size-3.5 shrink-0" aria-hidden />
        <span>
          <span className="whitespace-nowrap">{described.hours}</span>{" "}
          <span className="text-ink-subtle">
            ({described.assumptions.join(", ")})
          </span>
        </span>
      </span>
    );
  }

  return (
    <div className="flex gap-3 rounded-md bg-surface-muted p-4">
      <Clock className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden />
      <div className="text-sm">
        <p className="font-medium text-ink">{described.hours} estimated</p>
        <p className="text-ink-muted">
          Assumes: {described.assumptions.join(" · ")}
        </p>
      </div>
    </div>
  );
}
