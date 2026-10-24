import { ArrowRightRegular, CheckRegular } from "@mingcute/react/core-regular";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { StateMessage } from "../../../components/ui/StateMessage";
import { useRealRoadmap } from "../hooks/useRealCareer";
import { useCompletedSteps, useSetStepComplete } from "../hooks/useRoadmapPreview";
import { getRoadmapPreviewState } from "../roadmapPreview.utils";
import { buildGaps, formatNameList, getStep } from "../skillCheck.utils";
import type { SkillCheckCareer, SkillCheckRecord, SkillCheckStep } from "../skillCheck.types";
import { PageHeading } from "./PageHeading";
import { RateSkillsDialog } from "./RateSkillsDialog";
import { SkillButton, SkillLink } from "./SkillButton";
import { Tag } from "./Tag";

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
  const realRoadmap = useRealRoadmap(career.name);

  const startOrder = record.startingPoint?.stepOrder ?? 1;
  const completed = completedQuery.data ?? [];
  const state = getRoadmapPreviewState(career, startOrder, completed);
  const gaps = buildGaps(career, record.answers ?? {});
  const gapSteps = new Set(gaps.map((gap) => gap.step.order));
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
  const nextGapNames = nextStep
    ? gaps.filter((gap) => gap.step.order === nextStep.order).map((gap) => gap.skill.name)
    : [];

  const realStep = nextStep ? realRoadmap.steps[nextStep.order - 1] : undefined;

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
        spacious
        title={career.name}
        description={`${state.completedCount} of ${total} steps complete`}
      />
      {record.startingPoint && (
        <section
          aria-label="Your starting point"
          className="flex flex-col gap-4 rounded-lg border border-brand-100 bg-brand-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 flex-col">
            <h2 className="font-display text-base leading-6 font-medium text-ink">
              You are starting at step {startOrder}
            </h2>
            <p className="text-sm leading-5 text-grey-600">
              {record.startingPoint.source === "ACCEPTED"
                ? "Suggested from your skill check, based on what you told us. "
                : ""}
              {startOrder > 2
                ? `Steps 1 to ${startOrder - 1} stay open and incomplete until you complete them.`
                : startOrder === 2
                  ? "Step 1 stays open and incomplete until you complete it."
                  : "You are beginning at the first step."}
            </p>
          </div>
          <Link
            to="/skill-check/$careerId/result"
            params={{ careerId: career.careerId }}
            className="focus-ring w-fit shrink-0 rounded text-sm leading-5 font-medium text-brand-600 hover:underline"
          >
            Change starting point
          </Link>
        </section>
      )}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_500px]">
        {allDone || !nextStep ? (
          <section className="flex flex-col gap-4 rounded-[24px] border-[1.5px] border-brand-600 bg-surface p-6 sm:p-8">
            <Tag tone="success" className="font-medium">
              All steps complete
            </Tag>
            <h2 className="font-display text-[32px] leading-10 font-medium text-ink">
              You finished the {career.name} roadmap
            </h2>
            <p className="text-base leading-6 text-grey-600">
              You can retake the skill check any time to see how your answers have changed.
            </p>
            <Link
              to="/skill-check"
              className="focus-ring w-fit rounded text-sm leading-5 font-medium text-brand-600 hover:underline"
            >
              Back to Skill check
            </Link>
          </section>
        ) : (
          <section
            aria-labelledby="up-next-title"
            className="flex flex-col gap-4 rounded-[24px] border-[1.5px] border-brand-600 bg-surface p-6 sm:p-8"
          >
            <p className="text-[13px] leading-none font-medium text-brand-600 uppercase">
              Up next · Step {nextStep.order}
            </p>
            <h2
              id="up-next-title"
              className="font-display text-[32px] leading-10 font-medium text-ink"
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
                <Tag tone="info">Next step</Tag>
              </li>
              {gapSteps.has(nextStep.order) && (
                <li>
                  <Tag tone="warning">Gap</Tag>
                </li>
              )}
            </ul>
            {nextGapNames.length > 0 && (
              <p className="text-base leading-5 text-grey-600">
                The skills your skill check flagged as a gap here: {formatNameList(nextGapNames)}.
              </p>
            )}
            {gapSteps.has(nextStep.order) && (
              <p className="text-sm leading-5 text-grey-500">
                Why this step:{" "}
                {nextStep.order === startOrder
                  ? "it is the first topic where your check showed a gap"
                  : "your check showed a gap here"}
                {nextStep.order < total
                  ? `, and steps ${nextStep.order + 1} to ${total} build on it.`
                  : "."}
              </p>
            )}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-3">
                {realStep && realRoadmap.careerId && (
                  <SkillLink
                    to="/careers/$careerId/roadmap/$stepId"
                    params={{ careerId: realRoadmap.careerId, stepId: realStep.stepId }}
                  >
                    Open step {nextStep.order}
                    <ArrowRightRegular aria-hidden className="size-5" />
                  </SkillLink>
                )}
                <SkillButton
                  isPrimary={!realStep}
                  disabled={setComplete.isPending}
                  onClick={() => complete(nextStep)}
                >
                  Mark step {nextStep.order} complete
                  {!realStep && <ArrowRightRegular aria-hidden className="size-5" />}
                </SkillButton>
              </div>
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
          className="flex flex-col overflow-hidden rounded-[24px] border border-grey-100 bg-surface lg:sticky lg:top-32"
        >
          <div className="flex items-baseline justify-between gap-3 px-4 pt-4 pb-3">
            <h2 id="all-steps-title" className="font-display text-base leading-6 font-medium text-ink">
              All steps
            </h2>
            <p className="text-sm leading-5 text-grey-600">
              {state.completedCount} of {total} complete
            </p>
          </div>
          <ol className="flex flex-col">
            {state.earlierOpen.length > 0 && (
              <li>
                <button
                  type="button"
                  aria-expanded={showEarlier}
                  onClick={() => setShowEarlier((value) => !value)}
                  className="focus-ring flex min-h-[52px] w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-sm leading-5 text-grey-600 transition-colors duration-200 ease-out hover:bg-grey-50 motion-reduce:transition-none"
                >
                  <span>
                    {state.earlierOpen.length} earlier step
                    {state.earlierOpen.length === 1 ? "" : "s"}, still open
                  </span>
                  <span className="font-medium text-brand-600">
                    {showEarlier ? "Hide" : "Show"}
                  </span>
                </button>
                <div
                  className={clsx(
                    "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                    showEarlier ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <ol inert={!showEarlier} className="flex min-h-0 flex-col overflow-hidden">
                    {state.earlierOpen.map((step) => (
                      <StepRow key={step.order} step={step} done={false} current={false} />
                    ))}
                  </ol>
                </div>
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
        title={
          ratingStep
            ? `${getStep(career, ratingStep.order)?.title}: how confident are you?`
            : undefined
        }
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
        "flex items-center gap-3 px-4 py-4 transition-colors duration-200 ease-out motion-reduce:transition-none",
        current ? "bg-brand-50" : "bg-surface",
      )}
    >
      <span
        aria-hidden
        className={clsx(
          "grid size-7 shrink-0 place-items-center rounded-md border-2 text-brand-600",
          current || done ? "border-brand-600" : "border-grey-200",
        )}
      >
        {done && (
          <CheckRegular className="size-4 animate-in zoom-in-50 duration-200 motion-reduce:animate-none" />
        )}
      </span>
      <span className="min-w-0 flex-1 text-base leading-5 font-medium text-ink">
        {step.order}. {step.title}
        {done && <span className="sr-only"> (complete)</span>}
      </span>
      <ChevronRight aria-hidden className="size-4 shrink-0 text-grey-500" />
    </li>
  );
}
