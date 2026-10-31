import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "../../../components/ui/Button";
import { Skeleton } from "../../../components/ui/Skeleton";
import { useCareerProgress } from "../hooks/useCareerProgress";
import { getStepStatus } from "../progress.utils";
import SelfReportedNote from "./SelfReportedNote";
import StartTrackingButton from "./StartTrackingButton";
import StepCompletionButton from "./StepCompletionButton";

type StepProgressSectionProps = {
  careerId: string;
  careerTitle: string;
  stepId: string;
  stepTitle: string;
};

export default function StepProgressSection({
  careerId,
  careerTitle,
  stepId,
  stepTitle,
}: StepProgressSectionProps) {
  const { progress, retry } = useCareerProgress(careerId);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  switch (progress.kind) {
    case "loading":
      return (
        <div role="status" aria-label="Loading your progress">
          <Skeleton className="h-12 w-full rounded-[16px]" />
        </div>
      );

    case "error":
      return (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-md border border-line p-4 text-sm text-ink sm:flex-row sm:items-center sm:justify-between"
        >
          <p>We couldn’t load your progress for this step.</p>
          <Button isPrimary={false} className="w-fit" onClick={retry}>
            Try again
          </Button>
        </div>
      );

    case "signed-out":
      return (
        <p className="rounded-md bg-surface-muted p-4 text-sm text-ink-muted">
          <Link
            to="/login"
            search={{ redirect: pathname }}
            className="font-medium text-brand-700 underline"
          >
            Sign in
          </Link>{" "}
          to mark this step done and track your progress.
        </p>
      );

    case "untracked":
    case "inactive":
      return (
        <div className="flex flex-col gap-3 rounded-md bg-surface-muted p-4">
          <p className="text-sm text-ink-muted">
            {progress.kind === "untracked"
              ? "Save this roadmap to mark steps done as you go."
              : "Make this your active pathway to keep marking steps done."}
          </p>
          <StartTrackingButton
            careerId={careerId}
            careerTitle={careerTitle}
            activeCareerTitle={progress.activeCareerTitle}
            label={progress.kind === "untracked" ? "Start tracking" : "Make active"}
          />
        </div>
      );

    case "active": {
      const status = getStepStatus(progress.statuses, stepId);
      const isNext =
        progress.progress.nextStepId === stepId && status !== "COMPLETED";

      return (
        <div className="flex flex-col gap-3">
          {isNext && (
            <p className="text-sm font-medium text-brand-700">
              This is your suggested next step.
            </p>
          )}
          <StepCompletionButton
            stepId={stepId}
            stepTitle={stepTitle}
            status={status}
            variant="full"
          />
          <SelfReportedNote />
        </div>
      );
    }
  }
}
