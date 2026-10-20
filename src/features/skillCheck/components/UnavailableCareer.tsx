import { Link } from "@tanstack/react-router";
import { TrackIcon } from "../../../components/TrackIcon";
import type { SkillCheckCareer } from "../skillCheck.types";
import { BackLink } from "./BackLink";
import { PageHeading } from "./PageHeading";

export function UnavailableCareer({ career }: { career: SkillCheckCareer }) {
  return (
    <>
      <BackLink />
      <PageHeading
        title="Skill check"
        description="See your existing skills and career gaps, based on what you share."
      />
      <section
        aria-labelledby="unavailable-title"
        className="flex flex-col items-center gap-4 rounded-3xl border border-grey-100 bg-surface px-6 py-16 text-center"
      >
        <TrackIcon icon={career.icon} size={80} />
        <div className="flex max-w-md flex-col gap-1">
          <h2
            id="unavailable-title"
            className="font-display text-2xl leading-7 font-medium text-ink"
          >
            No reviewed skill list for {career.name} yet
          </h2>
          <p className="text-sm leading-5 text-grey-600">
            We only check reviewed skills. Explore the roadmap or choose a ready career.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/careers"
            className="focus-ring inline-flex items-center justify-center rounded-[16px] border border-b-4 border-grey-100 bg-surface px-4 py-3 text-base leading-5 font-semibold text-grey-600 transition-colors hover:bg-grey-50 motion-reduce:transition-none"
          >
            Explore careers
          </Link>
          <Link
            to="/skill-check"
            className="focus-ring inline-flex items-center justify-center rounded-[16px] border-b-4 border-brand-700 bg-brand-600 px-4 py-3 text-base leading-5 font-semibold text-white transition-colors hover:bg-brand-700 motion-reduce:transition-none"
          >
            Check another career
          </Link>
        </div>
      </section>
    </>
  );
}
