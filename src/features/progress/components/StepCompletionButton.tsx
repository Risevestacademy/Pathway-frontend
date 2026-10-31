import clsx from "clsx";
import { Check, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import type {
  PathwayStepStatus,
  StepCompletionStatus,
} from "../../../lib/api/progress.api";
import { useSetStepStatus } from "../hooks/useProgressMutations";

type StepCompletionButtonProps = {
  stepId: string;
  stepTitle: string;
  /** The last status the server confirmed. */
  status: PathwayStepStatus;
  variant?: "compact" | "full";
};

/**
 * Shows the saved status, never the one being saved, so a failed save can't
 * leave a step looking done.
 */
export default function StepCompletionButton({
  stepId,
  stepTitle,
  status,
  variant = "compact",
}: StepCompletionButtonProps) {
  const mutation = useSetStepStatus(stepId);
  const [announcement, setAnnouncement] = useState("");
  const done = status === "COMPLETED";
  const target: StepCompletionStatus = done ? "NOT_STARTED" : "COMPLETED";

  const save = (next: StepCompletionStatus) => {
    setAnnouncement("");
    mutation.mutate(next, {
      onSuccess: () =>
        setAnnouncement(
          next === "COMPLETED"
            ? `${stepTitle} marked done`
            : `${stepTitle} marked not done`,
        ),
    });
  };

  const error = mutation.isError && (
    <p role="alert" className="text-sm text-danger-700">
      We couldn’t save that, so this step is still marked{" "}
      {done ? "done" : "not done"}.{" "}
      <button
        type="button"
        onClick={() => save(mutation.variables ?? target)}
        className="focus-ring cursor-pointer rounded font-medium underline"
      >
        Try again
      </button>
    </p>
  );

  const liveRegion = (
    <span role="status" className="sr-only">
      {announcement}
    </span>
  );

  if (variant === "full") {
    return (
      <div className="flex flex-col gap-3">
        {done ? (
          <div
            className="
              flex flex-col gap-3 rounded-md border border-success-600/30
              bg-success-50 p-4 sm:flex-row sm:items-center sm:justify-between
            "
          >
            <p className="flex items-center gap-2 text-sm font-medium text-success-700">
              <CheckCircle2 className="size-5 shrink-0" aria-hidden />
              You marked this step done
            </p>
            <Button
              isPrimary={false}
              disabled={mutation.isPending}
              onClick={() => save("NOT_STARTED")}
            >
              {mutation.isPending && <LoadingSpinner className="size-4" />}
              {mutation.isPending ? "Saving" : "Mark as not done"}
            </Button>
          </div>
        ) : (
          <Button
            size="lg"
            className="w-full"
            disabled={mutation.isPending}
            onClick={() => save("COMPLETED")}
          >
            {mutation.isPending ? (
              <LoadingSpinner className="size-5" />
            ) : (
              <Check className="size-5" aria-hidden />
            )}
            {mutation.isPending ? "Saving" : "Mark this step done"}
          </Button>
        )}
        {error}
        {liveRegion}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={mutation.isPending}
        onClick={() => save(target)}
        className={clsx(
          "focus-ring inline-flex w-fit cursor-pointer items-center gap-1.5",
          "rounded-pill border px-3 py-1 text-xs font-medium whitespace-nowrap",
          "transition-colors duration-200 ease-out motion-reduce:transition-none",
          "disabled:cursor-wait disabled:opacity-70",
          done
            ? "border-success-600/30 bg-success-50 text-success-700 hover:bg-success-50/60"
            : "border-line-strong bg-surface text-ink-muted hover:bg-surface-muted hover:text-ink",
        )}
      >
        {mutation.isPending ? (
          <LoadingSpinner className="size-3.5" />
        ) : done ? (
          <CheckCircle2 className="size-3.5" aria-hidden />
        ) : (
          <Circle className="size-3.5" aria-hidden />
        )}
        {mutation.isPending ? "Saving" : done ? "Done" : "Mark done"}
        <span className="sr-only">
          {done ? `: ${stepTitle}. Select to mark it not done` : `: ${stepTitle}`}
        </span>
      </button>
      {error}
      {liveRegion}
    </div>
  );
}
