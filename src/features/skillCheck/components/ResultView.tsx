import { useState } from "react";
import { useSkillResult } from "../hooks/useSkillResult";
import { useStartingPointDecision } from "../hooks/useStartingPointDecision";
import type {
  SkillCheckCareer,
  SkillCheckCareerSummary,
  SkillCheckRecord,
} from "../skillCheck.types";
import { BackLink } from "./BackLink";
import { PageHeading } from "./PageHeading";
import { RateSkillsDialog } from "./RateSkillsDialog";
import type { RatableSkill } from "./RateSkillsDialog";
import { ResultCounts } from "./ResultCounts";
import { SkillGapList } from "./SkillGapList";
import { StartingPointAside } from "./StartingPointAside";
import { SwitchPathwayDialog } from "./SwitchPathwayDialog";

export function ResultView({
  career,
  record,
  careers,
}: {
  career: SkillCheckCareer;
  record: SkillCheckRecord;
  careers: SkillCheckCareerSummary[];
}) {
  const { result, suggestion, isActive, otherActive, isRetakeChange, decisionOpen, eyebrow } =
    useSkillResult(career, record, careers);
  const decision = useStartingPointDecision({
    careerId: career.careerId,
    isActive,
    otherActive,
  });
  const [rating, setRating] = useState<RatableSkill | null>(null);
  const [ratingOpen, setRatingOpen] = useState(false);

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

      {decision.savedMessage && (
        <p
          role="status"
          className="rounded-lg border border-success-600/30 bg-success-50 px-4 py-3 text-sm leading-5 text-success-700"
        >
          {decision.savedMessage}
        </p>
      )}

      {decision.failed && (
        <p
          role="alert"
          className="rounded-lg border border-danger-600/30 bg-danger-50 px-4 py-3 text-sm leading-5 text-danger-700"
        >
          That did not save. Nothing was changed, so you can try again.
        </p>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_384px]">
        <div className="flex min-w-0 flex-col gap-4">
          <ResultCounts counts={result.counts} />
          <SkillGapList
            gaps={result.gaps}
            careerId={career.careerId}
            isRetakeChange={isRetakeChange}
            onRate={(skill) => {
              setRating(skill);
              setRatingOpen(true);
            }}
          />
        </div>

        <StartingPointAside
          career={career}
          record={record}
          suggestion={suggestion}
          decisionOpen={decisionOpen}
          isRetakeChange={isRetakeChange}
          otherActiveName={otherActive?.name ?? null}
          busy={decision.busy}
          onChoose={(choice) => void decision.choose(choice)}
          onKeep={() => void decision.keepCurrent()}
          onSaveAndStay={() => void decision.saveAndStay()}
        />
      </div>

      <RateSkillsDialog
        open={ratingOpen}
        careerId={career.careerId}
        title={rating ? `Rate ${rating.name}` : "Rate your skills"}
        skills={rating ? [rating] : []}
        onClose={() => setRatingOpen(false)}
        onSaved={() => decision.setSavedMessage("Rating saved. It is your own view of this skill.")}
      />
      <SwitchPathwayDialog
        open={decision.confirmOpen}
        targetName={career.name}
        currentName={otherActive?.name ?? null}
        pending={decision.busy}
        error={decision.hasError}
        onCancel={decision.closeConfirm}
        onConfirm={() => void decision.confirmSwitch()}
      />
    </>
  );
}
