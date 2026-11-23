import { ArrowRightRegular } from "@mingcute/react/core-regular";
import { TrackIcon } from "../../../components/TrackIcon";
import { ESTIMATED_MINUTES, HOW_IT_WORKS_STEPS, formatCheckedDate } from "../skillCheck.copy";
import { countAnswered, countAnswers, getStartStep } from "../skillCheck.utils";
import type { SkillAnswerMap, SkillAssessment } from "../skillCheck.types";
import { InfoNote } from "./InfoNote";
import { SkillButton, SkillLink } from "./SkillButton";
import { StepNumberList } from "./StepNumberList";
import { Tag } from "./Tag";

const cardClass =
  "flex min-w-0 flex-col gap-4 rounded-[28px] border border-grey-100 bg-surface p-5 sm:p-6";

export function ActiveCareerCard({
  assessment,
  draft,
  onStart,
  onShowHow,
  onRetake,
}: {
  assessment: SkillAssessment;
  draft: SkillAnswerMap | null;
  onStart: () => void;
  onShowHow: () => void;
  onRetake: () => void;
}) {
  const { hasResult, checkedAt } = assessment;
  const draftAnswered = draft ? countAnswered(assessment.skills, draft) : 0;
  const hasDraft = !hasResult && draftAnswered > 0;

  return (
    <section aria-labelledby="active-career-title" className={cardClass}>
      <div className="flex items-center gap-2">
        <TrackIcon icon={assessment.icon} size={40} />
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <h2
              id="active-career-title"
              className="font-display text-2xl leading-[1.2] font-medium tracking-[-0.01em] text-ink"
            >
              {assessment.name}
            </h2>
            {hasResult ? (
              <Tag tone="success" className="px-1.5 font-medium">
                Result saved
              </Tag>
            ) : (
              <Tag tone="brand" className="px-1.5 font-medium">
                Active pathway
              </Tag>
            )}
          </div>
          {hasResult && checkedAt && (
            <p className="text-xs leading-4 text-grey-600">
              Last checked {formatCheckedDate(checkedAt)}.
            </p>
          )}
        </div>
      </div>

      {hasResult ? (
        <ResultSummary assessment={assessment} onRetake={onRetake} />
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
              ? `You have answered ${draftAnswered} of ${assessment.skills.length} skills. Your answers are saved on this device.`
              : `Based on your answers, not a test. Takes about ${ESTIMATED_MINUTES} mins.`}
          </InfoNote>
        </>
      )}
    </section>
  );
}

function ResultSummary({
  assessment,
  onRetake,
}: {
  assessment: SkillAssessment;
  onRetake: () => void;
}) {
  const counts = countAnswers(assessment.skills, assessment.saved);
  const startStep = getStartStep(assessment);

  return (
    <>
      <div className="flex flex-col gap-4 rounded-2xl border border-grey-50 bg-surface py-4">
        <dl className="flex gap-6 px-6">
          <SummaryCount value={counts.have} label="Have" />
          <span aria-hidden className="w-px self-stretch bg-grey-100" />
          <SummaryCount value={counts.dontHave} label="Not yet" />
          <span aria-hidden className="w-px self-stretch bg-grey-100" />
          <SummaryCount value={counts.notSure} label="Not sure" />
        </dl>
        <div className="h-px bg-grey-100" />
        <div className="flex flex-wrap items-center gap-2 px-6 text-sm leading-5 text-grey-600">
          <span>Your starting point</span>
          <Tag tone="brand" className="font-medium">
            {startStep ? `Step ${startStep.order} · ${startStep.title}` : "From the beginning"}
          </Tag>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <SkillLink
          to="/my-pathway/skill-check/$careerId/result"
          params={{ careerId: assessment.careerId }}
          className="flex-1"
        >
          View result
          <ArrowRightRegular aria-hidden className="size-5" />
        </SkillLink>
        <SkillButton isPrimary={false} className="flex-1" onClick={onRetake}>
          Retake skill check
        </SkillButton>
      </div>
      <InfoNote>
        Retaking clears your answers and ratings for this pathway. Your completed steps stay
        as they are.
      </InfoNote>
    </>
  );
}

function SummaryCount({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dd className="text-xl leading-6 font-medium text-ink">{value}</dd>
      <dt className="text-sm leading-5 text-grey-600">{label}</dt>
    </div>
  );
}
