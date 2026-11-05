import { BackLinkTo } from "../../skillCheck/components/BackLink";
import type { PathwayOverview } from "../overview.utils";
import { OverallProgressCard } from "./OverallProgressCard";
import { OverviewHero } from "./OverviewHero";
import { OverviewTabs } from "./OverviewTabs";
import { PathwayCompleteCard } from "./PathwayCompleteCard";
import { UpNextCard } from "./UpNextCard";
import { YourRoadmapCard } from "./YourRoadmapCard";

/** One career's pathway: its roadmap, the step to do next, and overall progress. */
export function OverviewScreen({
  careerId,
  careerTitle,
  overview,
}: {
  careerId: string;
  careerTitle: string;
  overview: PathwayOverview;
}) {
  const { steps, nextStepId, completed, total, started, upNext } = overview;
  const finished = total > 0 && completed >= total;

  return (
    <div className="flex flex-col gap-6">
      <BackLinkTo to="/my-pathway" label="Back" />
      <OverviewHero title={careerTitle} stepCount={steps.length} />
      <OverviewTabs careerId={careerId} current="overview" />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <YourRoadmapCard careerId={careerId} steps={steps} nextStepId={nextStepId} />
        <div className="flex flex-col gap-6">
          {upNext ? (
            <UpNextCard careerId={careerId} step={upNext} started={started} />
          ) : (
            finished && <PathwayCompleteCard total={total} />
          )}
          <OverallProgressCard completed={completed} total={total} />
        </div>
      </div>
    </div>
  );
}
