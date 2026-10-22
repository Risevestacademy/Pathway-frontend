import { ArrowRightRegular } from "@mingcute/react/core-regular";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useRealCareerId } from "../hooks/useRealCareer";
import { useSkillRatings } from "../hooks/useSkillCheck";
import { getRatingsForSkill } from "../rating.utils";
import {
  useResolveStartingPoint,
  useSwitchActiveCareer,
} from "../hooks/useSkillCheckActions";
import { capitalise, describeStartingPoint, pluralise } from "../skillCheck.copy";
import {
  formatNameList,
  formatStepRange,
  getEarlierSteps,
  getSkillCheckResult,
  getStep,
} from "../skillCheck.utils";
import type {
  SkillCheckCareer,
  SkillCheckCareerSummary,
  SkillCheckRecord,
  StartingPoint,
} from "../skillCheck.types";
import { BackLink } from "./BackLink";
import { PageHeading } from "./PageHeading";
import { RateSkillsDialog } from "./RateSkillsDialog";
import type { RatableSkill } from "./RateSkillsDialog";
import { SkillButton, SkillLink } from "./SkillButton";
import { SwitchPathwayDialog } from "./SwitchPathwayDialog";
import { Tag } from "./Tag";
import type { TagTone } from "./Tag";

export function ResultView({
  career,
  record,
  careers,
}: {
  career: SkillCheckCareer;
  record: SkillCheckRecord;
  careers: SkillCheckCareerSummary[];
}) {
  const result = getSkillCheckResult(career, record.answers, record.previousAnswers);
  const { suggestion } = result;
  const active = careers.find((item) => item.isActive) ?? null;
  const isActive = active?.careerId === career.careerId;
  const otherActive = active && !isActive ? active : null;
  const isRetakeChange = record.startingPoint !== null && record.needsDecision;
  const isFirstDecision = record.startingPoint === null;
  const decisionOpen = isRetakeChange || (isFirstDecision && suggestion !== null);

  const ratings = useSkillRatings().data ?? [];
  const resolve = useResolveStartingPoint(career.careerId);
  const switchCareer = useSwitchActiveCareer();
  const [pending, setPending] = useState<StartingPoint | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [rating, setRating] = useState<RatableSkill | null>(null);
  const [ratingOpen, setRatingOpen] = useState(false);

  const eyebrow = isRetakeChange
    ? `${career.name} · Retake`
    : otherActive
      ? `${career.name} · Not in your pathway`
      : career.name;

  const finish = async (decision: StartingPoint | null, message: string) => {
    await resolve.mutateAsync(decision);
    setSavedMessage(message);
  };

  const choose = async (decision: StartingPoint) => {
    if (!isActive && otherActive) {
      setPending(decision);
      setConfirmOpen(true);
      return;
    }
    try {
      if (!isActive) await switchCareer.mutateAsync(career.careerId);
      await finish(decision, `Starting point saved. You will start at step ${decision.stepOrder}.`);
    } catch {
      return;
    }
  };

  const confirmSwitch = async () => {
    if (!pending) return;
    try {
      await switchCareer.mutateAsync(career.careerId);
      await finish(pending, `Pathway switched. You will start at step ${pending.stepOrder}.`);
      setConfirmOpen(false);
    } catch {
      return;
    }
  };

  const keepCurrent = async () => {
    try {
      await finish(null, "Your starting point stays the same.");
    } catch {
      return;
    }
  };

  const saveAndStay = async () => {
    try {
      await finish(null, "Result saved. Your active pathway has not changed.");
    } catch {
      return;
    }
  };

  const busy = resolve.isPending || switchCareer.isPending;
  const failed = (resolve.isError || switchCareer.isError) && !confirmOpen;

  return (
    <>
      <BackLink />
      <PageHeading
        spacious
        eyebrow={eyebrow}
        title={isRetakeChange ? "Your answers changed" : "Here is where you stand"}
        description={
          isRetakeChange
            ? "Based on your new answers. Your current starting point stays until you accept a new one."
            : "Based on what you told us. Self-reported, not a test or a certification."
        }
      />

      {savedMessage && (
        <p
          role="status"
          className="rounded-lg border border-success-600/30 bg-success-50 px-4 py-3 text-sm leading-5 text-success-700"
        >
          {savedMessage}
        </p>
      )}

      {failed && (
        <p
          role="alert"
          className="rounded-lg border border-danger-600/30 bg-danger-50 px-4 py-3 text-sm leading-5 text-danger-700"
        >
          That did not save. Nothing was changed, so you can try again.
        </p>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_384px]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <CountCard
              tone="success"
              tag="Have"
              value={result.counts.have}
              label={`${pluralise(result.counts.have, "skill", "skills")} you can do today`}
            />
            <CountCard
              tone="warning"
              tag="Not yet"
              value={result.counts.notYet}
              label={`${pluralise(result.counts.notYet, "skill", "skills")} you are still learning`}
            />
            <CountCard
              tone="neutral"
              tag="Not sure"
              value={result.counts.notSure}
              label={`${pluralise(result.counts.notSure, "skill", "skills")} to check again`}
            />
          </div>

          <section
            aria-labelledby="gaps-title"
            className="overflow-hidden rounded-[20px] border border-grey-100 bg-surface"
          >
            <div className="flex flex-col gap-0.5 bg-brand-50 px-6 py-5">
              <h2 id="gaps-title" className="font-display text-xl leading-6 font-medium text-ink">
                {isRetakeChange ? "Remaining skill gaps, in roadmap order" : "Skill gaps, in roadmap order"}
              </h2>
              <p className="text-sm leading-5 text-grey-600">
                Each gap links to the step where you&rsquo;ll learn it.
              </p>
            </div>
            {result.gaps.length === 0 ? (
              <p className="border-t border-grey-100 px-6 py-4 text-base leading-5 text-grey-600">
                No gaps found. You marked every skill as Have.
              </p>
            ) : (
              <ol>
                {result.gaps.map((gap, index) => {
                  const latest = getRatingsForSkill(ratings, career.careerId, gap.skill.id).at(-1);
                  const ratedLabel = latest
                    ? latest.value === "NOT_SURE"
                      ? "Your rating: not sure"
                      : `Your rating: ${latest.value} of 5`
                    : null;
                  return (
                  <li
                    key={gap.skill.id}
                    className="flex items-start gap-4 border-t border-grey-100 px-6 py-4"
                  >
                    <span
                      aria-hidden
                      className="grid size-7 shrink-0 place-items-center rounded-lg border border-brand-200 bg-brand-100 text-sm leading-4 font-medium text-brand-700"
                    >
                      {index + 1}
                    </span>
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="flex flex-wrap items-center gap-2 text-base leading-5 font-medium text-ink">
                        {gap.skill.name}
                        <Tag tone={gap.answer === "NOT_YET" ? "warning" : "neutral"}>
                          {gap.answer === "NOT_YET" ? "Not yet" : "Not sure"}
                        </Tag>
                      </p>
                      <p className="text-sm leading-5 text-grey-600">{gap.skill.reason}</p>
                      <p className="text-sm leading-5 font-medium text-brand-600">
                        Step {gap.step.order} · {gap.step.title}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setRating({ id: gap.skill.id, name: gap.skill.name });
                          setRatingOpen(true);
                        }}
                        className="focus-ring w-fit cursor-pointer rounded text-sm leading-5 text-grey-600 underline transition-colors duration-200 hover:text-ink motion-reduce:transition-none"
                      >
                        <span aria-hidden>{ratedLabel ? "Update rating" : "Rate this skill"}</span>
                        <span className="sr-only">{`${ratedLabel ? "Update rating for" : "Rate"} ${gap.skill.name}`}</span>
                      </button>
                      {ratedLabel && (
                        <p className="text-sm leading-5 text-grey-600">{ratedLabel}</p>
                      )}
                    </div>
                  </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>

        <aside
          aria-label="Your starting point"
          className="flex min-w-0 flex-col gap-4 rounded-[20px] border border-brand-100 bg-brand-50 p-6 lg:sticky lg:top-32"
        >
          {decisionOpen && suggestion ? (
            <SuggestionPanel
              career={career}
              record={record}
              stepOrder={suggestion.stepOrder}
              reason={describeReason(
                suggestion.reasonSkills.map((skill) => skill.name),
                suggestion.coveredStepOrders,
                isRetakeChange,
              )}
              isRetakeChange={isRetakeChange}
              otherActiveName={otherActive?.name ?? null}
              busy={busy}
              onAccept={() => void choose({ stepOrder: suggestion.stepOrder, source: "ACCEPTED" })}
              onDecline={() => void choose({ stepOrder: 1, source: "DECLINED" })}
              onKeep={() => void keepCurrent()}
              onSaveAndStay={() => void saveAndStay()}
            />
          ) : record.startingPoint ? (
            <SettledPanel career={career} startingPoint={record.startingPoint} />
          ) : (
            <NoGapPanel
              busy={busy}
              onStart={() => void choose({ stepOrder: 1, source: "DEFAULT" })}
            />
          )}
          <div className="border-t border-brand-200 pt-4">
            <Link
              to="/skill-check/$careerId"
              params={{ careerId: career.careerId }}
              className="focus-ring rounded text-sm leading-5 font-medium text-brand-600 hover:underline"
            >
              Edit my answers
            </Link>
          </div>
        </aside>
      </div>

      <RateSkillsDialog
        open={ratingOpen}
        careerId={career.careerId}
        title={rating ? `Rate ${rating.name}` : "Rate your skills"}
        skills={rating ? [rating] : []}
        onClose={() => setRatingOpen(false)}
        onSaved={() => setSavedMessage("Rating saved. It is your own view of this skill.")}
      />
      <SwitchPathwayDialog
        open={confirmOpen}
        targetName={career.name}
        currentName={otherActive?.name ?? null}
        pending={busy}
        error={switchCareer.isError || resolve.isError}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void confirmSwitch()}
      />
    </>
  );
}

function describeReason(names: string[], coveredStepOrders: number[], retake: boolean): string {
  if (names.length === 0) {
    return "Why: this is the first step linked to a skill you marked Not yet or Not sure.";
  }
  if (retake) {
    return `Why: you now marked ${formatNameList(names)} as Have.`;
  }
  return `Why: you marked ${formatNameList(names)} as Have, and ${formatStepRange(coveredStepOrders)} cover${coveredStepOrders.length === 1 ? "s" : ""} ${names.length === 1 ? "it" : "those"}.`;
}

function CountCard({
  tone,
  tag,
  value,
  label,
}: {
  tone: TagTone;
  tag: string;
  value: number;
  label: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-[20px] border border-grey-100 bg-surface p-5">
      <Tag tone={tone}>{tag}</Tag>
      <p className="text-4xl leading-10 font-medium text-ink tabular-nums">{value}</p>
      <p className="text-sm leading-5 text-grey-600">{label}</p>
    </div>
  );
}

function earlierNote(career: SkillCheckCareer, stepOrder: number): string | null {
  const earlier = getEarlierSteps(career, stepOrder).map((step) => step.order);
  if (earlier.length === 0) return null;
  return `${capitalise(formatStepRange(earlier))} ${earlier.length === 1 ? "stays" : "stay"} open and marked incomplete. Nothing is marked done for you.`;
}

function SuggestionPanel({
  career,
  record,
  stepOrder,
  reason,
  isRetakeChange,
  otherActiveName,
  busy,
  onAccept,
  onDecline,
  onKeep,
  onSaveAndStay,
}: {
  career: SkillCheckCareer;
  record: SkillCheckRecord;
  stepOrder: number;
  reason: string;
  isRetakeChange: boolean;
  otherActiveName: string | null;
  busy: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onKeep: () => void;
  onSaveAndStay: () => void;
}) {
  const step = getStep(career, stepOrder);
  const current = record.startingPoint;
  const currentStep = current ? getStep(career, current.stepOrder) : null;
  const switching = otherActiveName !== null;
  const verb = switching ? "Switch and start at" : "Start at";
  const note = earlierNote(career, stepOrder);

  return (
    <>
      {isRetakeChange && current && currentStep && (
        <div className="flex flex-col gap-1 rounded-lg border border-grey-50 bg-surface px-4 py-3 shadow-[0_4px_8px_rgba(0,0,0,0.04)]">
          <p className="text-sm leading-5 text-grey-600">Current starting point</p>
          <p className="text-base leading-5 font-medium text-ink">
            Step {current.stepOrder} · {currentStep.title}
          </p>
        </div>
      )}
      <div className="flex flex-col gap-3">
        <Tag tone="brand" className="font-medium">
          {isRetakeChange ? "New suggestion" : "Suggestion based on your answers"}
        </Tag>
        <h2 className="font-display text-xl leading-6 font-medium text-ink">
          Start at step {stepOrder}, {step?.title}
        </h2>
        <p className="text-base leading-5 text-grey-600">{reason}</p>
      </div>
      <div className="flex flex-col gap-3">
        <SkillButton disabled={busy} onClick={onAccept}>
          {isRetakeChange ? `Accept step ${stepOrder}` : `${verb} step ${stepOrder}`}
          <ArrowRightRegular aria-hidden className="size-5" />
        </SkillButton>
        {isRetakeChange && current ? (
          <SkillButton isPrimary={false} disabled={busy} onClick={onKeep}>
            Keep step {current.stepOrder}
          </SkillButton>
        ) : (
          stepOrder !== 1 && (
            <SkillButton isPrimary={false} disabled={busy} onClick={onDecline}>
              {verb} step 1
            </SkillButton>
          )
        )}
      </div>
      <p className="text-sm leading-5 text-grey-600">
        {isRetakeChange
          ? "Your completed steps and ratings are not changed."
          : switching
            ? `Switching keeps your ${otherActiveName} progress.${note ? ` ${note}` : ""}`
            : note}
      </p>
      {switching && !isRetakeChange && (
        <button
          type="button"
          disabled={busy}
          onClick={onSaveAndStay}
          className="focus-ring w-fit cursor-pointer rounded text-sm leading-5 font-medium text-brand-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save result, stay on my pathway
        </button>
      )}
    </>
  );
}

function SettledPanel({
  career,
  startingPoint,
}: {
  career: SkillCheckCareer;
  startingPoint: StartingPoint;
}) {
  const step = getStep(career, startingPoint.stepOrder);
  const note = earlierNote(career, startingPoint.stepOrder);
  const realId = useRealCareerId(career.name);

  return (
    <>
      <div className="flex flex-col gap-3">
        <Tag tone="brand" className="font-medium">
          Your starting point
        </Tag>
        <h2 className="font-display text-xl leading-6 font-medium text-ink">
          Step {startingPoint.stepOrder}, {step?.title}
        </h2>
        <p className="text-sm leading-5 text-grey-600">{describeStartingPoint(startingPoint)}</p>
        {note && <p className="text-sm leading-5 text-grey-600">{note}</p>}
      </div>
      <div className="flex flex-col gap-3">
        {realId ? (
          <SkillLink to="/careers/$careerId/roadmap" params={{ careerId: realId }}>
            Go to roadmap
            <ArrowRightRegular aria-hidden className="size-5" />
          </SkillLink>
        ) : (
          <SkillLink to="/skill-check/$careerId/roadmap" params={{ careerId: career.careerId }}>
            Go to roadmap
            <ArrowRightRegular aria-hidden className="size-5" />
          </SkillLink>
        )}
        <SkillLink to="/skill-check" isPrimary={false}>
          Back to Skill check
        </SkillLink>
      </div>
    </>
  );
}

function NoGapPanel({ busy, onStart }: { busy: boolean; onStart: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-display text-xl leading-6 font-medium text-ink">
        You marked every skill as Have
      </h2>
      <p className="text-base leading-5 text-grey-600">
        There is no gap to start from. You can still begin at step 1 and move at your own pace.
      </p>
      <SkillButton disabled={busy} onClick={onStart}>
        Start at step 1
        <ArrowRightRegular aria-hidden className="size-5" />
      </SkillButton>
    </div>
  );
}
