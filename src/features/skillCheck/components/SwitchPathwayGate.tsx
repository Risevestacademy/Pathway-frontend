import { ArrowRightRegular } from "@mingcute/react/core-regular";
import { TrackIcon } from "../../../components/TrackIcon";
import { useSwitchPathway } from "../hooks/useSkillCheckActions";
import type { SkillCheckCareerSummary } from "../skillCheck.types";
import { BackLink } from "./BackLink";
import { PageHeading } from "./PageHeading";
import { SkillButton, SkillLink } from "./SkillButton";

/**
 * Skill check only covers the active pathway, so checking another career
 * starts with switching to it.
 */
export function SwitchPathwayGate({
  career,
  currentName,
}: {
  career: SkillCheckCareerSummary;
  currentName: string | null;
}) {
  const switchPathway = useSwitchPathway();

  return (
    <>
      <BackLink />
      <PageHeading
        title="Skill check"
        description="See your existing skills and career gaps, based on what you share."
      />
      <section
        aria-labelledby="switch-title"
        className="flex flex-col items-center gap-6 rounded-3xl border border-grey-100 bg-surface px-6 py-14 text-center sm:px-8"
      >
        <TrackIcon icon={career.icon} size={80} />
        <div className="flex max-w-md flex-col gap-2">
          <h2 id="switch-title" className="font-display text-2xl leading-7 font-medium text-ink">
            {currentName
              ? `Switch your active pathway to ${career.name}?`
              : `Start the ${career.name} pathway?`}
          </h2>
          <p className="text-sm leading-5 text-grey-600">
            {currentName
              ? `Skill check covers your active pathway. Your progress on ${currentName} is saved, and you can switch back any time.`
              : "Skill check covers your active pathway. You can switch to another pathway any time."}
          </p>
        </div>
        {switchPathway.isError && (
          <p role="alert" className="text-sm leading-5 text-danger-700">
            The switch did not save. Try again.
          </p>
        )}
        <div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row">
          <SkillLink to="/my-pathway/skill-check" isPrimary={false} className="flex-1">
            Not now
          </SkillLink>
          <SkillButton
            className="flex-1"
            disabled={switchPathway.isPending}
            onClick={() => switchPathway.mutate(career.careerId)}
          >
            {switchPathway.isPending ? "Switching" : currentName ? "Switch pathway" : "Start pathway"}
            {!switchPathway.isPending && <ArrowRightRegular aria-hidden className="size-5" />}
          </SkillButton>
        </div>
      </section>
    </>
  );
}
