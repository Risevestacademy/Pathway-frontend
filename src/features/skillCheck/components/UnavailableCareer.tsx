import { TrackIcon } from "../../../components/TrackIcon";
import type { SkillAssessment } from "../skillCheck.types";
import { BackLink } from "./BackLink";
import { PageHeading } from "./PageHeading";
import { SkillLink } from "./SkillButton";

/** The active pathway has no skills linked to its steps yet. */
export function UnavailableCareer({ assessment }: { assessment: SkillAssessment }) {
  return (
    <>
      <BackLink />
      <PageHeading
        title="Skill check"
        description="See your existing skills and career gaps, based on what you share."
      />
      <section
        aria-labelledby="unavailable-title"
        className="flex flex-col items-center gap-6 rounded-3xl border border-grey-100 bg-surface px-6 py-14 text-center sm:px-8"
      >
        <TrackIcon icon={assessment.icon} size={80} />
        <div className="flex max-w-xs flex-col gap-2">
          <h2
            id="unavailable-title"
            className="font-display text-2xl leading-6 font-medium text-ink"
          >
            No skill list for {assessment.name} yet
          </h2>
          <p className="text-sm leading-5 text-grey-600">
            Its roadmap steps don&rsquo;t list any skills yet. Explore the roadmap or check
            another career.
          </p>
        </div>
        <div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row">
          <SkillLink
            to="/my-pathway/$careerId/overview"
            params={{ careerId: assessment.careerId }}
            isPrimary={false}
            className="flex-1"
          >
            View roadmap
          </SkillLink>
          <SkillLink to="/my-pathway/skill-check" className="flex-1">
            Check another career
          </SkillLink>
        </div>
      </section>
    </>
  );
}
