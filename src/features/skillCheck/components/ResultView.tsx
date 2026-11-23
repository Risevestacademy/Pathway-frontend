import { useState } from "react";
import { getHaveSkills, getSkillCheckResult } from "../skillCheck.utils";
import type { SkillAssessment } from "../skillCheck.types";
import { BackLink } from "./BackLink";
import { HaveSkillsList } from "./HaveSkillsList";
import { PageHeading } from "./PageHeading";
import { RateSkillsDialog } from "./RateSkillsDialog";
import type { RatableSkill } from "./RateSkillsDialog";
import { ResultCounts } from "./ResultCounts";
import { SkillGapList } from "./SkillGapList";
import { StartingPointAside } from "./StartingPointAside";

export function ResultView({ assessment }: { assessment: SkillAssessment }) {
  const result = getSkillCheckResult(assessment);
  const [rating, setRating] = useState<RatableSkill | null>(null);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  return (
    <>
      <BackLink />
      <PageHeading
        spacious
        eyebrow={assessment.name}
        title="Here is where you stand"
        description="Based on what you told us. Self-reported, not a test or a certification."
      />

      {savedMessage && (
        <p
          role="status"
          className="rounded-lg border border-success-600/30 bg-success-50 px-4 py-3 text-sm leading-5 text-success-700"
        >
          {savedMessage}
        </p>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_384px]">
        <div className="flex min-w-0 flex-col gap-4">
          <ResultCounts counts={result.counts} />
          <SkillGapList gaps={result.gaps} />
          <HaveSkillsList
            skills={getHaveSkills(assessment)}
            ratings={assessment.ratings}
            onRate={(skill) => {
              setRating(skill);
              setRatingOpen(true);
            }}
          />
        </div>

        <StartingPointAside assessment={assessment} startStep={result.startStep} />
      </div>

      <RateSkillsDialog
        open={ratingOpen}
        skill={rating}
        onClose={() => setRatingOpen(false)}
        onSaved={() => setSavedMessage("Rating saved. It is your own view of this skill.")}
      />
    </>
  );
}
