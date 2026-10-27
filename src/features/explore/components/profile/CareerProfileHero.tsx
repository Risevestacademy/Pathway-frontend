import { ArrowRight, WandSparkles } from "lucide-react";
import heroCubes from "@/assets/images/discover-hero-cubes.svg";
import { LandingLinkButton } from "@/features/landing/components/LandingButton";
import { landingButtonStyles } from "@/features/landing/landingButton.styles";
import type { Career } from "@/types/career.types";
import { CAREER_PROFILE } from "../../explore.copy";
import { audienceLabel } from "../../explore.utils";
import type { PathwaySummary } from "../../hooks/useCareerPathway";

const dash = "–";

export default function CareerProfileHero({
  career,
  pathway,
}: {
  career: Career;
  pathway: PathwaySummary | null | undefined;
}) {
  const audience = audienceLabel(career.levels);
  const stats = [
    { label: CAREER_PROFILE.stats.stages, value: pathway?.stages ?? career.roadmapStepCount ?? dash },
    { label: CAREER_PROFILE.stats.resources, value: pathway?.resources ?? dash },
    { label: CAREER_PROFILE.stats.skills, value: career.tags.length || dash },
  ];

  return (
    <section
      aria-labelledby="career-heading"
      className="relative overflow-hidden rounded-[28px] border border-grey-100 bg-white bg-linear-to-r from-white from-45% to-brand-100"
    >
      <img
        src={heroCubes}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-auto max-w-none select-none md:block"
      />

      <div className="relative flex flex-col gap-8 p-6 sm:p-10 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[520px]">
          {audience && (
            <span className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-[#fff1d7] px-3 text-[15px] text-[#b98900]">
              <WandSparkles aria-hidden className="size-4" strokeWidth={1.75} />
              {audience}
            </span>
          )}
          <h1
            id="career-heading"
            className="mt-5 font-landing-display text-[2rem] leading-[1.1] font-bold tracking-[-0.02em] text-ink sm:text-[2.5rem]"
          >
            {career.title}
          </h1>
          <p className="mt-3 font-landing-body text-lg leading-7 text-grey-500">{career.description}</p>
          <div className="mt-6">
            {career.roadmapId ? (
              <LandingLinkButton to="/careers/$careerId/roadmap" params={{ careerId: career.id }}>
                {CAREER_PROFILE.start}
                <ArrowRight aria-hidden className="size-5" />
              </LandingLinkButton>
            ) : (
              <span aria-disabled="true" className={landingButtonStyles({ variant: "secondary", size: "lg", className: "cursor-not-allowed opacity-70" })}>
                {CAREER_PROFILE.roadmapSoon}
              </span>
            )}
          </div>
        </div>

        <dl className="grid shrink-0 grid-cols-3 divide-x divide-grey-100 rounded-2xl border border-grey-100 bg-white py-4 text-center md:border-0 md:text-left">
          {stats.map((stat) => (
            <div key={stat.label} className="px-2 sm:px-4 md:px-6">
              <dt className="font-landing-body text-[14px] text-grey-500 sm:text-[15px]">{stat.label}</dt>
              <dd className="mt-2 font-landing-body text-[26px] leading-none text-ink">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
