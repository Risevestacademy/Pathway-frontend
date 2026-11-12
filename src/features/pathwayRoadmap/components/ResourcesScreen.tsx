import { useCallback, useState } from "react";
import type { PathwayStepStatus } from "../../../lib/api/progress.api";
import { getStepStatus } from "../../progress/progress.utils";
import { BackLinkTo } from "../../skillCheck/components/BackLink";
import { useResourceTicks } from "../hooks/useResourceTicks";
import type { ResourceGroup } from "../resourceGroups.utils";
import { playStepCompleteSound } from "../stepCompleteSound";
import { Confetti } from "./Confetti";
import { OverviewHero } from "./OverviewHero";
import { OverviewTabs } from "./OverviewTabs";
import { PaidCoursesCard } from "./PaidCoursesCard";
import { SaveFailedBanner } from "./SaveFailedBanner";
import { ResourceStepCard } from "./ResourceStepCard";
import { ResourceStepNav } from "./ResourceStepNav";
import { StepCompleteDialog } from "./StepCompleteDialog";

/** One career's pathway resources: the steps down the side, and the one picked shown beside them. */
export function ResourcesScreen({
  careerId,
  careerTitle,
  stepCount,
  groups,
  statuses,
  progress,
}: {
  careerId: string;
  careerTitle: string;
  stepCount: number;
  groups: ResourceGroup[];
  /** Each step's saved status, or null when they aren't tracking this pathway. */
  statuses: Record<string, PathwayStepStatus> | null;
  /** How many steps they have completed out of how many, or null when that isn't known. */
  progress: { completed: number; total: number } | null;
}) {
  const { countTicked, isTicked, unsaved, retry } = useResourceTicks(careerId);
  const [pickedStepId, setPickedStepId] = useState<string | null>(null);
  const [completedStepId, setCompletedStepId] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const stopCelebrating = useCallback(() => setCelebrating(false), []);

  // Marking a step complete is worth a little celebration: confetti, and a chime.
  const stepCompleted = (stepId: string) => {
    setCompletedStepId(stepId);
    setCelebrating(true);
    playStepCompleteSound();
  };

  // The most recent tick the browser couldn't save, so it can be named.
  const resourceTitles = new Map(
    groups.flatMap((group) => group.resources.map((resource) => [resource.id, resource.title] as const)),
  );
  const unsavedId = [...unsaved].reverse().find((id) => resourceTitles.has(id));

  // Until one is picked, or if the one picked has gone, it is the first step.
  const selected = groups.find((group) => group.stepId === pickedStepId) ?? groups[0];

  const completedIndex = groups.findIndex((group) => group.stepId === completedStepId);
  const completed = completedIndex === -1 ? null : groups[completedIndex];
  const next = completedIndex === -1 ? undefined : groups[completedIndex + 1];

  return (
    <div className="flex flex-col gap-6">
      <BackLinkTo to="/my-pathway" label="Back" />
      <OverviewHero title={careerTitle} stepCount={stepCount} />
      <OverviewTabs careerId={careerId} current="resources" />

      {!selected ? (
        <p className="text-sm text-ink-muted">No resources for this roadmap yet</p>
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
            {unsavedId && (
              <SaveFailedBanner resourceTitle={resourceTitles.get(unsavedId) ?? ""} onRetry={retry} />
            )}
            <ResourceStepCard
              careerId={careerId}
              group={selected}
              status={statuses ? getStepStatus(statuses, selected.stepId) : null}
              onStepCompleted={() => stepCompleted(selected.stepId)}
            />
            <PaidCoursesCard
              careerId={careerId}
              resources={selected.paid}
              hasFreeResources={selected.resources.length > 0}
            />
          </div>
        </div>
      )}

      {celebrating && <Confetti onDone={stopCelebrating} />}

      {completed && (
        <StepCompleteDialog
          open
          onOpenChange={(open) => {
            if (!open) setCompletedStepId(null);
          }}
          step={{ number: completed.number, title: completed.title }}
          resources={completed.resources.map((resource) => ({
            id: resource.id,
            title: resource.title,
            ticked: isTicked(resource.id),
          }))}
          progress={progress}
          nextStep={next ? { title: next.title } : null}
          onNextStep={() => {
            if (next) setPickedStepId(next.stepId);
            setCompletedStepId(null);
          }}
        />
      )}
    </div>
  );
}
