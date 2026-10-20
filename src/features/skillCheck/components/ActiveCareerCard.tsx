import { ArrowRightRegular } from "@mingcute/react/core-regular";
import { Link } from "@tanstack/react-router";
import { Button } from "../../../components/ui/Button";
import { TrackIcon } from "../../../components/TrackIcon";
import {
  ESTIMATED_MINUTES,
  HOW_IT_WORKS_STEPS,
  describeStartingPoint,
  formatCheckedDate,
} from "../skillCheck.copy";
import { countAnswered, countAnswers } from "../skillCheck.utils";
import type {
  SkillCheckCareer,
  SkillCheckCareerSummary,
  SkillCheckRecord,
} from "../skillCheck.types";
import { InfoNote } from "./InfoNote";
import { StepNumberList } from "./StepNumberList";
import { Tag } from "./Tag";

export function ActiveCareerCard({
  summary,
  career,
  record,
  onStart,
  onShowHow,
}: {
  summary: SkillCheckCareerSummary;
  career: SkillCheckCareer;
  record: SkillCheckRecord | null;
  onStart: () => void;
  onShowHow: () => void;
}) {
  const hasResult = Boolean(record?.completedAt);
  const draftAnswered = record?.draft ? countAnswered(career.skills, record.draft) : 0;
  const hasDraft = !hasResult && draftAnswered > 0;

  return (
    <section
      aria-labelledby="active-career-title"
      className="flex min-w-0 flex-col gap-4 rounded-3xl border border-grey-100 bg-surface p-5 sm:p-6"
    >
      <div className="flex items-center gap-2">
        <TrackIcon icon={summary.icon} size={40} />
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <h2
            id="active-career-title"
            className="font-display text-2xl leading-7 font-medium text-ink"
          >
            {summary.name}
          </h2>
          {hasResult ? (
            <Tag tone="success">Result saved</Tag>
          ) : (
            summary.isActive && <Tag tone="brand">Active pathway</Tag>
          )}
        </div>
      </div>

      {hasResult && record?.completedAt ? (
        <ResultSummary career={career} record={record} onStart={onStart} />
      ) : (
        <>
          <StepNumberList steps={HOW_IT_WORKS_STEPS} />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="flex-1" onClick={hasDraft ? onStart : onShowHow}>
              {hasDraft ? "Continue skill check" : "Start skill check"}
              <ArrowRightRegular aria-hidden className="size-5" />
            </Button>
            <Button isPrimary={false} size="lg" className="flex-1" onClick={onShowHow}>
              How it works
            </Button>
          </div>
          <InfoNote>
            {hasDraft
              ? `You have answered ${draftAnswered} of ${career.skills.length} skills. Your answers are saved.`
              : `Based on your answers, not a test. Takes about ${ESTIMATED_MINUTES} mins.`}
          </InfoNote>
        </>
      )}
    </section>
  );
}

function ResultSummary({
  career,
  record,
  onStart,
}: {
  career: SkillCheckCareer;
  record: SkillCheckRecord;
  onStart: () => void;
}) {
  const counts = countAnswers(career.skills, record.answers);
  const hasDraft = record.draft !== null;

  return (
    <>
      <p className="-mt-3 text-sm leading-4 text-grey-500">
        Last checked {formatCheckedDate(record.completedAt ?? "")}.
      </p>
      <div className="rounded-2xl border border-grey-50">
        <dl className="flex gap-6 p-4">
          <SummaryCount value={counts.have} label="Have" />
          <SummaryCount value={counts.notYet} label="Not yet" />
          <SummaryCount value={counts.notSure} label="Not sure" />
        </dl>
        <div className="flex flex-wrap items-center gap-2 border-t border-grey-50 px-4 py-4 text-base leading-5 text-grey-600">
          <span>Your starting point</span>
          {record.startingPoint ? (
            <Tag tone="brand">{describeStartingPoint(record.startingPoint)}</Tag>
          ) : (
            <Tag tone="warning">Not chosen yet</Tag>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <ViewResultLink careerId={career.careerId} />
        <Button isPrimary={false} size="lg" className="flex-1" onClick={onStart}>
          {hasDraft ? "Continue retake" : "Retake skill check"}
        </Button>
      </div>
      <InfoNote>
        Retaking never changes your completed steps or your starting point. You choose
        whether to accept a new suggestion.
      </InfoNote>
    </>
  );
}

function SummaryCount({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dd className="text-lg leading-6 font-semibold text-ink">{value}</dd>
      <dt className="text-sm leading-4 text-grey-600">{label}</dt>
    </div>
  );
}

function ViewResultLink({ careerId }: { careerId: string }) {
  return (
    <Link
      to="/skill-check/$careerId/result"
      params={{ careerId }}
      className="focus-ring inline-flex flex-1 items-center justify-center gap-2 rounded-[16px] border-b-4 border-brand-700 bg-brand-600 px-4 py-3 text-base leading-5 font-semibold text-white transition-colors hover:bg-brand-700 motion-reduce:transition-none"
    >
      View result
      <ArrowRightRegular aria-hidden className="size-5" />
    </Link>
  );
}
