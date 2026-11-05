import type { PathwayStepStatus } from "../../../lib/api/progress.api";
import { getStepStatus } from "../../progress/progress.utils";
import { BackLink } from "../../skillCheck/components/BackLink";
import type { ResourceGroup } from "../resourceGroups.utils";
import { OverviewHero } from "./OverviewHero";
import { OverviewTabs } from "./OverviewTabs";
import { ResourceStepCard } from "./ResourceStepCard";

/** One career's pathway resources, a card for each step that has some. */
export function ResourcesScreen({
  careerId,
  careerTitle,
  stepCount,
  groups,
  statuses,
}: {
  careerId: string;
  careerTitle: string;
  stepCount: number;
  groups: ResourceGroup[];
  /** Each step's saved status, or null when they aren't tracking this pathway. */
  statuses: Record<string, PathwayStepStatus> | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <BackLink fallbackTo="/my-pathway" />
      <OverviewHero title={careerTitle} stepCount={stepCount} />
      <OverviewTabs careerId={careerId} current="resources" />

      {groups.length === 0 ? (
        <p className="text-ink-muted">No resources for this roadmap yet</p>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <ResourceStepCard
              key={group.stepId}
              careerId={careerId}
              group={group}
              status={statuses ? getStepStatus(statuses, group.stepId) : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
