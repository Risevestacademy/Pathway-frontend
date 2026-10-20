import { TrackIcon } from "../../../components/TrackIcon";
import { useRealCareerId } from "../hooks/useRealCareer";
import type { SkillCheckCareer } from "../skillCheck.types";
import { BackLink } from "./BackLink";
import { PageHeading } from "./PageHeading";
import { SkillLink } from "./SkillButton";

export function UnavailableCareer({ career }: { career: SkillCheckCareer }) {
  const realId = useRealCareerId(career.name);

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
        <TrackIcon icon={career.icon} size={80} />
        <div className="flex max-w-xs flex-col gap-2">
          <h2
            id="unavailable-title"
            className="font-display text-2xl leading-6 font-medium text-ink"
          >
            No reviewed skill list for {career.name} yet
          </h2>
          <p className="text-sm leading-5 text-grey-600">
            We only check reviewed skills. Explore the roadmap or choose a ready career.
          </p>
        </div>
        <div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row">
          {realId ? (
            <SkillLink
              to="/careers/$careerId/roadmap"
              params={{ careerId: realId }}
              isPrimary={false}
              className="flex-1"
            >
              View roadmap
            </SkillLink>
          ) : (
            <SkillLink to="/careers" isPrimary={false} className="flex-1">
              Explore careers
            </SkillLink>
          )}
          <SkillLink to="/skill-check" className="flex-1">
            Check another career
          </SkillLink>
        </div>
      </section>
    </>
  );
}
