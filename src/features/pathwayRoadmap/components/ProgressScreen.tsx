import { BackLinkTo } from "../../skillCheck/components/BackLink";
import { useResourceTicks } from "../hooks/useResourceTicks";
import type { PathwayOverview } from "../overview.utils";
import { completedSteps, tickedResources } from "../progressView.utils";
import type { ResourceGroup } from "../resourceGroups.utils";
import { CompletedCard } from "./CompletedCard";
import { OverallProgressCard } from "./OverallProgressCard";
import { OverviewHero } from "./OverviewHero";
import { OverviewTabs } from "./OverviewTabs";
import { PathwayCompleteCard } from "./PathwayCompleteCard";
import { UpNextCard } from "./UpNextCard";

/** One career's progress: how far they are, what they have completed, and what comes next. */
export function ProgressScreen({
  careerId,
  careerTitle,
  overview,
  groups,
  activation,
}: {
  careerId: string;
  careerTitle: string;
  overview: PathwayOverview;
  groups: ResourceGroup[];
  /** Set when this career isn't their active pathway yet, so continuing a step must make it active. */
  activation: { activeCareerTitle: string | null } | null;
}) {
  const { isTicked } = useResourceTicks(careerId);
  const { steps, completed, total, started, upNext } = overview;
  const finished = total > 0 && completed >= total;

  return (
    <div className="flex flex-col gap-6">
      <BackLinkTo to="/my-pathway" label="Back" />
      <OverviewHero title={careerTitle} stepCount={steps.length} />
      <OverviewTabs careerId={careerId} current="progress" />

      <p className="rounded-2xl bg-grey-50 px-5 py-4 text-sm text-ink">
        Progress is what you tell us. We do not check that you finished a step.
      </p>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <OverallProgressCard completed={completed} total={total} />
        <div className="flex flex-col gap-6">
          <CompletedCard
            careerId={careerId}
            steps={completedSteps(steps)}
            resources={tickedResources(groups, isTicked)}
          />
          {upNext ? (
            <UpNextCard
              careerId={careerId}
              step={upNext}
              started={started}
              activation={activation ? { careerTitle, activeCareerTitle: activation.activeCareerTitle } : undefined}
            />
          ) : (
            finished && <PathwayCompleteCard total={total} />
          )}
        </div>
      </div>
    </div>
  );
}
