import { ArrowRightRegular, CheckRegular } from "@mingcute/react/core-regular";
import clsx from "clsx";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useCompletedSteps, useSetStepComplete } from "../hooks/useRoadmapPreview";
import { getRoadmapPreviewState } from "../roadmapPreview.utils";
import { buildGaps, getStep } from "../skillCheck.utils";
import type { SkillCheckCareer, SkillCheckRecord, SkillCheckStep } from "../skillCheck.types";
import { PageHeading } from "./PageHeading";
import { RateSkillsDialog } from "./RateSkillsDialog";
import { SkillButton } from "./SkillButton";
import { Tag } from "./Tag";
import { StateMessage } from "../../../components/ui/StateMessage";

export function RoadmapPreview({
  career,
  record,
}: {
  career: SkillCheckCareer;
  record: SkillCheckRecord;
}) {
  const completedQuery = useCompletedSteps(career.careerId);
  const setComplete = useSetStepComplete(career.careerId);
  const [ratingStep, setRatingStep] = useState<SkillCheckStep | null>(null);
  const [showEarlier, setShowEarlier] = useState(false);

  const startOrder = record.startingPoint?.stepOrder ?? 1;
  const completed = completedQuery.data ?? [];
  const state = getRoadmapPreviewState(career, startOrder, completed);
  const gapSteps = new Set(
    buildGaps(career, record.answers ?? {}).map((gap) => gap.step.order),
  );
  const total = career.steps.length;
  const allDone = total > 0 && state.completedCount === total;

  if (completedQuery.isError) {
    return (
      <StateMessage
        kind="error"
        title="We could not load your roadmap"
        body="Your progress is safe. Check your connection and try again."
        action={
          <SkillButton onClick={() => void completedQuery.refetch()}>Try again</SkillButton>
        }
      />
    );
  }

  if (completedQuery.isPending) {
    return <StateMessage kind="loading" title="Loading your roadmap" />;
  }

  if (total === 0) {
    return (
      <StateMessage
        kind="empty"
        title="This roadmap has no steps yet"
        body="Check back soon or choose another career."
      />
    );
  }

  const nextStep = state.nextStep;
  const ratableSkills = ratingStep
    ? career.skills.filter((skill) => skill.stepOrder === ratingStep.order)
    : [];

  function complete(step: SkillCheckStep) {
    setComplete.mutate(
      { stepOrder: step.order, complete: true },
      {
        onSuccess: () => {
          if (career.skills.some((skill) => skill.stepOrder === step.order)) {
            setRatingStep(step);
          }
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title={`${career.name} roadmap`}
        description={`${state.completedCount} of ${total} steps complete`}
      />
      {record.startingPoint && (
        <section
          aria-label="Your starting point"
          className="flex flex-col gap-4 rounded-2xl border border-brand-100 bg-brand-50 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="font-display text-xl leading-6 font-medium text-ink">
              You are starting at step {startOrder}
            </h2>
            <p className="text-sm leading-5 text-grey-600">
              {record.startingPoint.source === "ACCEPTED"
                ? "Suggested from your skill check, based on what you told us. "
                : ""}
              {startOrder > 1
                ? `Steps 1${startOrder > 2 ? ` to ${startOrder - 1}` : ""} stay open and incomplete until you complete them.`
                : "You are beginning at the first step."}
            </p>
          </div>
          <Link
            to="/skill-check/$careerId/result"
            params={{ careerId: career.careerId }}
            className="focus-ring w-fit shrink-0 rounded-lg border border-b-4 border-grey-100 bg-surface px-4 py-2 text-base leading-5 font-medium text-grey-600 transition-colors duration-200 ease-out hover:bg-grey-50 motion-reduce:transition-none"
          >
            Change starting point
          </Link>
        </section>
      )}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)]">
        {allDone || !nextStep ? (
          <section className="flex flex-col gap-3 rounded-3xl border border-grey-100 bg-surface p-6 sm:p-8">
            <Tag tone="success" className="font-medium">
              All steps complete
            </Tag>
            <h2 className="font-display text-2xl leading-8 font-medium text-ink">
              You finished the {career.name} roadmap
            </h2>
            <p className="text-base leading-6 text-grey-600">
              You can retake the skill check any time to see how your answers have changed.
            </p>
            <Link
              to="/skill-check"
              className="focus-ring w-fit rounded text-base font-medium text-brand-600 hover:underline"
            >
              Back to Skill check
            </Link>
          </section>
        ) : (
          <section
            aria-labelledby="up-next-title"
            className="flex flex-col gap-6 rounded-3xl bg-surface p-6 outline-[1.5px] -outline-offset-1 outline-accent-600 sm:p-8"
          >
            <div className="flex flex-col gap-3">
              <p className="text-sm leading-4 font-medium tracking-wide text-grey-600">
                UP NEXT · STEP {nextStep.order}
              </p>
              <h2
                id="up-next-title"
                className="font-display text-2xl leading-8 font-medium text-ink"
              >
                {nextStep.title}
              </h2>
              <ul className="flex flex-wrap gap-2">
                {nextStep.order === startOrder && (
                  <li>
                    <Tag tone="brand" className="font-medium">
                      Start here
                    </Tag>
                  </li>
                )}
                <li>
                  <Tag tone="neutral">Next step</Tag>
                </li>
                {gapSteps.has(nextStep.order) && (
                  <li>
                    <Tag tone="warning">Gap</Tag>
                  </li>
                )}
              </ul>
              {gapSteps.has(nextStep.order) && (
                <p className="text-base leading-6 text-grey-600">
                  Why this step: your check showed a gap here
                  {nextStep.order < total
                    ? `, and steps ${nextStep.order + 1} to ${total} build on it.`
                    : "."}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <SkillButton
                disabled={setComplete.isPending}
                onClick={() => complete(nextStep)}
                className="w-fit"
              >
                Mark step {nextStep.order} complete
                <ArrowRightRegular aria-hidden className="size-5" />
              </SkillButton>
              {setComplete.isError && (
                <p role="alert" className="text-sm leading-5 text-danger-600">
                  We could not save that. Try again.
                </p>
              )}
            </div>
          </section>
        )}
        <aside
          aria-labelledby="all-steps-title"
          className="flex flex-col gap-4 rounded-3xl border border-grey-100 bg-surface p-5 lg:sticky lg:top-32"
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="all-steps-title" className="font-display text-lg leading-6 font-medium text-ink">
              All steps
            </h2>
            <p className="text-sm leading-5 text-grey-600">
              {state.completedCount} of {total} complete
            </p>
          </div>
          <ol className="flex flex-col gap-2">
            {state.earlierOpen.length > 0 && (
              <li className="flex flex-col gap-2">
                <button
                  type="button"
                  aria-expanded={showEarlier}
                  onClick={() => setShowEarlier((value) => !value)}
                  className="focus-ring flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-xl bg-grey-50 px-4 py-3 text-left text-sm leading-5 text-grey-600 transition-colors duration-200 ease-out hover:bg-grey-100 motion-reduce:transition-none"
                >
                  <span>
                    {state.earlierOpen.length} earlier step
                    {state.earlierOpen.length === 1 ? "" : "s"}, still open
                  </span>
                  <span className="font-medium text-brand-600">
                    {showEarlier ? "Hide" : "Show"}
                  </span>
                </button>
                {showEarlier && (
                  <ol className="flex flex-col gap-2 animate-in fade-in duration-200 motion-reduce:animate-none">
                    {state.earlierOpen.map((step) => (
                      <StepRow
                        key={step.order}
                        step={step}
                        done={false}
                        current={false}
                      />
                    ))}
                  </ol>
                )}
              </li>
            )}
            {state.visibleSteps.map((step) => (
              <StepRow
                key={step.order}
                step={step}
                done={completed.includes(step.order)}
                current={nextStep?.order === step.order && !allDone}
              />
            ))}
          </ol>
        </aside>
      </div>
      <RateSkillsDialog
        open={ratingStep !== null}
        careerId={career.careerId}
        tag={ratingStep ? `Step ${ratingStep.order} complete` : undefined}
        title={ratingStep ? `${getStep(career, ratingStep.order)?.title}: how confident are you?` : undefined}
        skills={ratableSkills}
        onClose={() => setRatingStep(null)}
      />
    </div>
  );
}

function StepRow({
  step,
  done,
  current,
}: {
  step: SkillCheckStep;
  done: boolean;
  current: boolean;
}) {
  return (
    <li
      aria-current={current ? "step" : undefined}
      className={clsx(
        "flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-200 ease-out motion-reduce:transition-none",
        current ? "bg-accent-50" : "bg-surface",
      )}
    >
      <span
        aria-hidden
        className={clsx(
          "grid size-7 shrink-0 place-items-center rounded-lg border-2 text-sm leading-5 font-medium",
          done
            ? "border-brand-500 bg-brand-500 text-white"
            : current
              ? "border-accent-600 text-ink"
              : "border-grey-100 text-grey-600",
        )}
      >
        {done ? <CheckRegular className="size-4" /> : step.order}
      </span>
      <span className="min-w-0 flex-1 text-base leading-5 font-medium text-ink">{step.title}</span>
      {done && <span className="sr-only">Complete</span>}
    </li>
  );
}
