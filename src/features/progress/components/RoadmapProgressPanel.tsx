import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, PartyPopper } from "lucide-react";
import type { ReactNode } from "react";
import { Button, LinkButton } from "../../../components/ui/Button";
import { Skeleton } from "../../../components/ui/Skeleton";
import type { RoadmapStep } from "../../pathway/pathway.types";
import type { CareerProgress } from "../progress.types";
import { describeProgress, getStepStatus } from "../progress.utils";
import ProgressBar from "./ProgressBar";
import SelfReportedNote from "./SelfReportedNote";
import StartTrackingButton from "./StartTrackingButton";

type RoadmapProgressPanelProps = {
  careerId: string;
  careerTitle: string;
  steps: RoadmapStep[];
  progress: CareerProgress;
  onRetry: () => void;
};

export default function RoadmapProgressPanel({
  careerId,
  careerTitle,
  steps,
  progress,
  onRetry,
}: RoadmapProgressPanelProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  switch (progress.kind) {
    case "loading":
      return (
        <Panel>
          <div role="status" aria-label="Loading your progress">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-4 h-2 w-full" />
            <Skeleton className="mt-3 h-4 w-1/2" />
          </div>
        </Panel>
      );

    case "error":
      return (
        <Panel>
          <div role="alert" className="flex flex-col gap-3">
            <p className="text-sm text-ink">
              We couldn’t load your progress. Your saved steps are safe.
            </p>
            <Button isPrimary={false} className="w-fit" onClick={onRetry}>
              Try again
            </Button>
          </div>
        </Panel>
      );

    case "signed-out":
      return (
        <Panel title="Track your progress">
          <p className="text-sm text-ink-muted">
            Sign in to mark steps done and pick up where you left off on any
            device.
          </p>
          <LinkButton to="/login" search={{ redirect: pathname }} className="mt-4 w-fit">
            Sign in
          </LinkButton>
        </Panel>
      );

    case "untracked":
      return (
        <Panel title="Track your progress">
          <p className="mb-4 text-sm text-ink-muted">
            Save this roadmap to mark steps done as you go.
          </p>
          <StartTrackingButton
            careerId={careerId}
            careerTitle={careerTitle}
            activeCareerTitle={progress.activeCareerTitle}
            label="Start tracking"
          />
        </Panel>
      );

    case "inactive":
      return (
        <Panel title="Your progress">
          <Counts completed={progress.counts.completed} total={progress.counts.total} />
          <p className="mt-4 mb-4 text-sm text-ink-muted">
            {progress.activeCareerTitle
              ? `${progress.activeCareerTitle} is your active pathway right now. `
              : ""}
            Make this one active to keep marking steps done.
          </p>
          <StartTrackingButton
            careerId={careerId}
            careerTitle={careerTitle}
            activeCareerTitle={progress.activeCareerTitle}
            label="Make active"
          />
          <SelfReportedNote className="mt-4" />
        </Panel>
      );

    case "active": {
      const { completed, total, nextStepId, startStepId } = progress.progress;
      const nextIndex = steps.findIndex((step) => step.stepId === nextStepId);
      const startIndex = steps.findIndex((step) => step.stepId === startStepId);
      const earlierOpen =
        startIndex > 0 &&
        steps
          .slice(0, startIndex)
          .some((step) => getStepStatus(progress.statuses, step.stepId) !== "COMPLETED");

      return (
        <Panel title="Your progress">
          <Counts completed={completed} total={total} />

          {nextIndex !== -1 ? (
            <Link
              to="/careers/$careerId/roadmap/$stepId"
              params={{ careerId, stepId: steps[nextIndex].stepId }}
              className="
                group mt-4 flex items-center gap-3 rounded-md
                bg-brand-50 p-3 text-sm
                focus-visible:outline-2 focus-visible:outline-brand-600
              "
            >
              <span className="flex-1">
                <span className="block text-xs font-medium tracking-wide text-brand-700 uppercase">
                  Up next · Step {nextIndex + 1}
                </span>
                <span className="font-medium text-ink">{steps[nextIndex].title}</span>
              </span>
              <ArrowRight
                className="size-4 shrink-0 text-brand-700 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                aria-hidden
              />
            </Link>
          ) : (
            total > 0 &&
            completed === total && (
              <p className="mt-4 flex items-center gap-2 rounded-md bg-success-50 p-3 text-sm font-medium text-success-700">
                <PartyPopper className="size-4 shrink-0" aria-hidden />
                You’ve marked every step done.
              </p>
            )
          )}

          {earlierOpen && (
            <p className="mt-3 text-sm text-ink-muted">
              You chose to start at step {startIndex + 1}. Earlier steps stay
              open and count as not done until you mark them.
            </p>
          )}

          <SelfReportedNote className="mt-4" />
        </Panel>
      );
    }
  }
}

function Panel({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section
      aria-label={title ?? "Your progress"}
      className="mt-6 rounded-lg border border-line bg-surface p-4 shadow-card md:p-5"
    >
      {title && (
        <h2 className="mb-3 font-display font-semibold text-ink">{title}</h2>
      )}
      {children}
    </section>
  );
}

function Counts({ completed, total }: { completed: number; total: number }) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <>
      <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
        <span className="text-ink">{describeProgress(completed, total)}</span>
        <span className="font-medium text-brand-700">{percentage}%</span>
      </div>
      <ProgressBar completed={completed} total={total} label="Roadmap progress" />
    </>
  );
}
