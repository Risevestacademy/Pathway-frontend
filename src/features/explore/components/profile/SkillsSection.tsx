import { Info } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Career } from "@/types/career.types";
import { CAREER_PROFILE } from "../../explore.copy";
import type { PathwaySummary } from "../../hooks/useCareerPathway";
import { panel, panelTitle, sourceNote } from "./profile.styles";

/** Skills chips plus three quick facts: first pathway step, roadmap size, typical education. */
export default function SkillsSection({
  career,
  pathway,
  pathwayLoading,
}: {
  career: Career;
  pathway: PathwaySummary | null | undefined;
  pathwayLoading: boolean;
}) {
  const education = career.entryConsiderations.find((item) => item.label === "Typical education")?.detail;
  const stages = pathway?.stages ?? career.roadmapStepCount ?? null;

  const roadmap = pathway
    ? `${pathway.stages} ${pathway.stages === 1 ? "stage" : "stages"}, ${pathway.resources} resources, in the order you should learn them.`
    : stages
      ? `${stages} ${stages === 1 ? "stage" : "stages"}, in the order you should learn them.`
      : null;

  const facts = [
    { label: CAREER_PROFILE.firstStep, value: pathway?.firstStep ?? null },
    { label: CAREER_PROFILE.roadmap, value: roadmap },
    { label: CAREER_PROFILE.education, value: education ?? null },
  ];

  return (
    <section aria-labelledby="skills-heading" className={panel}>
      <h2 id="skills-heading" className={panelTitle}>
        {CAREER_PROFILE.skills}
      </h2>
      {career.tags.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {career.tags.map((skill) => (
            <li
              key={skill}
              className="inline-flex h-8 items-center rounded-[8px] border-b-2 border-grey-150 bg-grey-50 px-3 font-landing-body text-[15px] text-grey-600"
            >
              {skill}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 font-landing-body text-[15px] text-grey-500">{CAREER_PROFILE.notYet}</p>
      )}

      <hr className="my-6 border-grey-100" />

      <dl className="grid gap-6 md:grid-cols-3 md:divide-x md:divide-grey-100">
        {facts.map((fact, index) => (
          <div key={fact.label} className={index > 0 ? "md:pl-6" : "md:pr-6"}>
            <dt className="font-landing-body text-[15px] text-grey-500">{fact.label}</dt>
            <dd className="mt-1 font-landing-body text-base leading-6 text-ink">
              {fact.value ?? (pathwayLoading && index < 2 ? <Skeleton className="mt-1 h-5 w-48" /> : CAREER_PROFILE.notYet)}
            </dd>
          </div>
        ))}
      </dl>

      <p className={`${sourceNote} mt-6`}>
        <Info aria-hidden className="size-3.5 shrink-0" strokeWidth={1.75} />
        {CAREER_PROFILE.footnote}
      </p>
    </section>
  );
}
