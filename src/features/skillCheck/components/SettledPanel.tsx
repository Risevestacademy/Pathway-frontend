import { ArrowRightRegular } from "@mingcute/react/core-regular";
import { START_REASON, earlierNote } from "../resultCopy";
import type { SkillAssessment, SkillCheckStep } from "../skillCheck.types";
import { SkillLink } from "./SkillButton";
import { Tag } from "./Tag";

export function SettledPanel({
  assessment,
  startStep,
}: {
  assessment: SkillAssessment;
  startStep: SkillCheckStep;
}) {
  const note = earlierNote(assessment, startStep.order);

  return (
    <>
      <div className="flex flex-col gap-3">
        <Tag tone="brand" className="font-medium">
          Your starting point
        </Tag>
        <h2 className="font-display text-xl leading-6 font-medium text-ink">
          Step {startStep.order}, {startStep.title}
        </h2>
        <p className="text-sm leading-5 text-grey-600">{START_REASON}</p>
        {note && <p className="text-sm leading-5 text-grey-600">{note}</p>}
      </div>
      <div className="flex flex-col gap-3">
        <SkillLink to="/my-pathway/$careerId/overview" params={{ careerId: assessment.careerId }}>
          Go to roadmap
          <ArrowRightRegular aria-hidden className="size-5" />
        </SkillLink>
        <SkillLink to="/my-pathway/skill-check" isPrimary={false}>
          Back to Skill check
        </SkillLink>
      </div>
    </>
  );
}
