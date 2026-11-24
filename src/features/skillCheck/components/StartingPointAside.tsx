import { Link } from "@tanstack/react-router";
import type { SkillAssessment, SkillCheckStep } from "../skillCheck.types";
import { NoGapPanel } from "./NoGapPanel";
import { SettledPanel } from "./SettledPanel";

export function StartingPointAside({
  assessment,
  startStep,
}: {
  assessment: SkillAssessment;
  startStep: SkillCheckStep | null;
}) {
  return (
    <aside
      aria-label="Your starting point"
      className="flex min-w-0 flex-col gap-4 rounded-[20px] border border-brand-100 bg-brand-50 p-6 lg:sticky lg:top-32"
    >
      {startStep ? (
        <SettledPanel assessment={assessment} startStep={startStep} />
      ) : (
        <NoGapPanel careerId={assessment.careerId} />
      )}
      <div className="border-t border-brand-200 pt-4">
        <Link
          to="/my-pathway/skill-check/$careerId"
          params={{ careerId: assessment.careerId }}
          className="focus-ring rounded text-sm leading-5 font-medium text-brand-600 hover:underline"
        >
          Edit my answers
        </Link>
      </div>
    </aside>
  );
}
