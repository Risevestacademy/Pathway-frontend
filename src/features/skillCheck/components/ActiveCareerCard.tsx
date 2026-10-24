import { ArrowRightRegular } from "@mingcute/react/core-regular";
import { TrackIcon } from "../../../components/TrackIcon";
import {
  ESTIMATED_MINUTES,
  HOW_IT_WORKS_STEPS,
  describeStartingPoint,
  formatCheckedDate,
} from "../skillCheck.copy";
import { countAnswered, countAnswers } from "../skillCheck.utils";
import type {
  SkillAnswerMap,
  SkillCheckCareer,
  SkillCheckCareerSummary,
  SkillCheckRecord,
} from "../skillCheck.types";
import { InfoNote } from "./InfoNote";
import { SkillButton, SkillLink } from "./SkillButton";
import { StepNumberList } from "./StepNumberList";
import { Tag } from "./Tag";

const cardClass =
  "flex min-w-0 flex-col gap-4 rounded-[28px] border border-grey-100 bg-surface p-5 sm:p-6";

function sameAnswers(a: SkillAnswerMap | null, b: SkillAnswerMap | null): boolean {
  if (!a || !b) return false;
  const keys = Object.keys({ ...a, ...b });
  return keys.every((key) => a[key] === b[key]);
}

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
    <section aria-labelledby="active-career-title" className={cardClass}>
      <div className="flex items-center gap-2">
        <TrackIcon icon={summary.icon} size={40} />
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <h2
              id="active-career-title"
              className="font-display text-2xl leading-[1.2] font-medium tracking-[-0.01em] text-ink"
            >
              {summary.name}
            </h2>
            {hasResult ? (
              <Tag tone="success" className="px-1.5 font-medium">
                Result saved
              </Tag>
            ) : (
              summary.isActive && (
                <Tag tone="brand" className="px-1.5 font-medium">
                  Active pathway
                </Tag>
              )
            )}
          </div>
          {hasResult && record?.completedAt && (
            <p className="text-xs leading-4 text-grey-600">
              Last checked {formatCheckedDate(record.completedAt)}.
            </p>
          )}
        </div>
      </div>

      {hasResult && record?.completedAt ? (
        <ResultSummary career={career} record={record} onStart={onStart} />
      ) : (
        <>
          <StepNumberList steps={HOW_IT_WORKS_STEPS} />
          <div className="flex flex-col gap-3 sm:flex-row">
            <SkillButton className="flex-1" onClick={hasDraft ? onStart : onShowHow}>
              {hasDraft ? "Continue skill check" : "Start skill check"}
              <ArrowRightRegular aria-hidden className="size-5" />
            </SkillButton>
            <SkillButton isPrimary={false} className="flex-1" onClick={onShowHow}>
              How it works
            </SkillButton>
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
  const retakeStarted =
    record.draft !== null && !sameAnswers(record.draft, record.answers);

  return (
    <>
      <div className="flex flex-col gap-4 rounded-2xl border border-grey-50 bg-surface py-4">
        <dl className="flex gap-6 px-6">
          <SummaryCount value={counts.have} label="Have" />
          <span aria-hidden className="w-px self-stretch bg-grey-100" />
          <SummaryCount value={counts.notYet} label="Not yet" />
          <span aria-hidden className="w-px self-stretch bg-grey-100" />
          <SummaryCount value={counts.notSure} label="Not sure" />
        </dl>
        <div className="h-px bg-grey-100" />
        <div className="flex flex-wrap items-center gap-2 px-6 text-sm leading-5 text-grey-600">
          <span>Your starting point</span>
          {record.startingPoint ? (
            <Tag tone="brand" className="font-medium">
              {describeStartingPoint(record.startingPoint)}
            </Tag>
          ) : (
            <Tag tone="warning" className="font-medium">
              Not chosen yet
            </Tag>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <SkillLink
          to="/skill-check/$careerId/result"
          params={{ careerId: career.careerId }}
          className="flex-1"
        >
          View result
          <ArrowRightRegular aria-hidden className="size-5" />
        </SkillLink>
        <SkillButton isPrimary={false} className="flex-1" onClick={onStart}>
          {retakeStarted ? "Continue retake" : "Retake skill check"}
        </SkillButton>
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
      <dd className="text-xl leading-6 font-medium text-ink">{value}</dd>
      <dt className="text-sm leading-4 text-grey-600">{label}</dt>
    </div>
  );
}
