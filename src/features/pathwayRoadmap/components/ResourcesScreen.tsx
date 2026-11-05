import { useState } from "react";
import type { PathwayStepStatus } from "../../../lib/api/progress.api";
import { getStepStatus } from "../../progress/progress.utils";
import { BackLink } from "../../skillCheck/components/BackLink";
import { useResourceTicks } from "../hooks/useResourceTicks";
import type { ResourceGroup } from "../resourceGroups.utils";
import { OverviewHero } from "./OverviewHero";
import { OverviewTabs } from "./OverviewTabs";
import { PaidCoursesCard } from "./PaidCoursesCard";
import { ResourceStepCard } from "./ResourceStepCard";
import { ResourceStepNav } from "./ResourceStepNav";

/** One career's pathway resources: the steps down the side, and the one picked shown beside them. */
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
  const { countTicked } = useResourceTicks(careerId);
  const [pickedStepId, setPickedStepId] = useState<string | null>(null);

  // Until one is picked, or if the one picked has gone, it is the first step.
  const selected = groups.find((group) => group.stepId === pickedStepId) ?? groups[0];

  return (
    <div className="flex flex-col gap-6">
      <BackLink fallbackTo="/my-pathway" />
      <OverviewHero title={careerTitle} stepCount={stepCount} />
      <OverviewTabs careerId={careerId} current="resources" />

      {!selected ? (
        <p className="text-ink-muted">No resources for this roadmap yet</p>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
          <ResourceStepNav
            items={groups.map((group) => ({
              stepId: group.stepId,
              number: group.number,
              title: group.title,
              ticked: countTicked(group.resources.map((resource) => resource.id)),
              total: group.resources.length,
            }))}
            selectedStepId={selected.stepId}
            onSelect={setPickedStepId}
          />
          <div className="flex flex-col gap-6">
            <ResourceStepCard
              careerId={careerId}
              group={selected}
              status={statuses ? getStepStatus(statuses, selected.stepId) : null}
            />
            <PaidCoursesCard
              careerId={careerId}
              resources={groups.flatMap((group) => group.paid)}
              hasFreeResources={selected.resources.length > 0}
            />
          </div>
        </div>
      )}
    </div>
  );
}
