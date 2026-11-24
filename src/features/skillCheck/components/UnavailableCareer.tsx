import { TrackIcon } from "../../../components/TrackIcon";
import type { TrackIconKey } from "../skillCheck.types";
import { BackLink } from "./BackLink";
import { PageHeading } from "./PageHeading";
import { SkillLink } from "./SkillButton";

/** The career's roadmap steps don't list any skills yet, so there is nothing to check. */
export function UnavailableCareer({
  careerId,
  name,
  icon,
  isActive,
}: {
  careerId: string;
  name: string;
  icon: TrackIconKey | null;
  isActive: boolean;
}) {
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
        <TrackIcon icon={icon} size={80} />
        <div className="flex max-w-xs flex-col gap-2">
          <h2
            id="unavailable-title"
            className="font-display text-2xl leading-6 font-medium text-ink"
          >
            No skill list for {name} yet
          </h2>
          <p className="text-sm leading-5 text-grey-600">
            Its roadmap steps don&rsquo;t list any skills yet. Explore the roadmap or check
            another career.
          </p>
        </div>
        <div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row">
          {isActive ? (
            <SkillLink
              to="/my-pathway/$careerId/overview"
              params={{ careerId }}
              isPrimary={false}
              className="flex-1"
            >
              View roadmap
            </SkillLink>
          ) : (
            <SkillLink
              to="/careers/$careerId/roadmap"
              params={{ careerId }}
              isPrimary={false}
              className="flex-1"
            >
              View roadmap
            </SkillLink>
          )}
          <SkillLink to="/my-pathway/skill-check" className="flex-1">
            Check another career
          </SkillLink>
        </div>
      </section>
    </>
  );
}
