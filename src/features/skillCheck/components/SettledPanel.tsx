import { ArrowRightRegular } from "@mingcute/react/core-regular";
import { earlierNote } from "../resultCopy";
import { describeStartingPoint } from "../skillCheck.copy";
import { getStep } from "../skillCheck.utils";
import type { SkillCheckCareer, StartingPoint } from "../skillCheck.types";
import { SkillLink } from "./SkillButton";
import { Tag } from "./Tag";

export function SettledPanel({
  career,
  startingPoint,
}: {
  career: SkillCheckCareer;
  startingPoint: StartingPoint;
}) {
  const step = getStep(career, startingPoint.stepOrder);
  const note = earlierNote(career, startingPoint.stepOrder);

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
        <SkillLink to="/skill-check/$careerId/roadmap" params={{ careerId: career.careerId }}>
          Go to roadmap
          <ArrowRightRegular aria-hidden className="size-5" />
        </SkillLink>
        <SkillLink to="/skill-check" isPrimary={false}>
          Back to Skill check
        </SkillLink>
      </div>
    </>
  );
}
