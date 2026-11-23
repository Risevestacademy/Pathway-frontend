import { Fragment, useCallback, useState } from "react";
import type { PathwayStepStatus } from "../../../lib/api/progress.api";
import { Button } from "../../../components/ui/Button";
import { getStepStatus } from "../../progress/progress.utils";
import { completedStageOf, type QuizStageRef } from "../../stageQuiz/completedStage";
import { StageQuizCard } from "../../stageQuiz/StageQuizCard";
import { BackLinkTo } from "../../skillCheck/components/BackLink";
import { useResourceTicks } from "../hooks/useResourceTicks";
import type { ResourceGroup } from "../resourceGroups.utils";
import { buildResourceSections } from "../resourceSections.utils";
import { playStepCompleteSound } from "../stepCompleteSound";
import { Confetti } from "./Confetti";
import { OverviewHero } from "./OverviewHero";
import { OverviewTabs } from "./OverviewTabs";
import { PaidCoursesCard } from "./PaidCoursesCard";
import { SaveFailedBanner } from "./SaveFailedBanner";
import { ResourceSectionNav } from "./ResourceSectionNav";
import { ResourceStepCard } from "./ResourceStepCard";
import { StepCompleteDialog } from "./StepCompleteDialog";

/**
 * One career's pathway resources: the stages down the side, and the one picked
 * shown beside them with each of its steps. When the stages aren't known, each
 * step is listed on its own instead.
 */
export function ResourcesScreen({
  careerId,
  careerTitle,
  stepCount,
  groups,
  statuses,
  progress,
  stages = [],
  stagesFailed = false,
  onRetryStages,
}: {
  careerId: string;
  careerTitle: string;
  stepCount: number;
  groups: ResourceGroup[];
  /** Each step's saved status, or null when they aren't tracking this pathway. */
  statuses: Record<string, PathwayStepStatus> | null;
  /** How many steps they have completed out of how many, or null when that isn't known. */
  progress: { completed: number; total: number } | null;
  /** The pathway's stages, to group the steps and to offer a finished stage's optional quiz. */
  stages?: QuizStageRef[];
  /** The stages couldn't be loaded, so there are no quizzes to offer. */
  stagesFailed?: boolean;
  onRetryStages?: () => void;
}) {
  const { countTicked, isTicked, unsaved, retry } = useResourceTicks(careerId);
  const [pickedId, setPickedId] = useState<string | null>(null);
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

  const sections = buildResourceSections(groups, stages);
  // Until one is picked, or if the one picked has gone, it is the first.
  const selected = sections.find((section) => section.id === pickedId) ?? sections[0];

  // The shown stage's quiz is always on offer; it says so when every step in the stage is complete.
  const quizStage = selected?.stageId ? stages.find((stage) => stage.id === selected.stageId) : undefined;
  const quizStageComplete =
    quizStage !== undefined &&
    selected?.groups[0] !== undefined &&
    completedStageOf(stages, statuses, selected.groups[0].stepId) !== null;

  const completedIndex = groups.findIndex((group) => group.stepId === completedStepId);
  const completed = completedIndex === -1 ? null : groups[completedIndex];
  const next = completedIndex === -1 ? undefined : groups[completedIndex + 1];

  const grouped = sections.some((section) => section.stageId !== null);

  return (
    <div className="flex flex-col gap-6">
      <BackLinkTo to="/my-pathway" label="Back" />
      <OverviewHero title={careerTitle} stepCount={stepCount} />
      <OverviewTabs careerId={careerId} current="resources" />

      {stagesFailed && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-grey-50 px-5 py-4 text-sm text-ink"
        >
          <p>We couldn’t load the stages, so the quizzes aren’t available right now.</p>
          {onRetryStages && (
            <Button isPrimary={false} onClick={onRetryStages}>
              Try loading the stages again
            </Button>
          )}
        </div>
      )}

      {!selected ? (
        <p className="text-sm text-ink-muted">No resources for this roadmap yet</p>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
          <ResourceSectionNav
            label={grouped ? "Stages" : "Steps"}
            items={sections.map((section) => {
              const ids = section.groups.flatMap((group) =>
                group.resources.map((resource) => resource.id),
              );
              return {
                id: section.id,
                title: section.title,
                ticked: countTicked(ids),
                total: ids.length,
              };
            })}
            selectedId={selected.id}
            onSelect={setPickedId}
          />
          <div className="flex flex-col gap-6">
            {unsavedId && (
              <SaveFailedBanner resourceTitle={resourceTitles.get(unsavedId) ?? ""} onRetry={retry} />
            )}
            {selected.groups.map((group) => (
              <Fragment key={group.stepId}>
                <ResourceStepCard
                  careerId={careerId}
                  group={group}
                  status={statuses ? getStepStatus(statuses, group.stepId) : null}
                  onStepCompleted={() => stepCompleted(group.stepId)}
                />
                <PaidCoursesCard
                  careerId={careerId}
                  resources={group.paid}
                  hasFreeResources={group.resources.length > 0}
                />
              </Fragment>
            ))}
            {quizStage && (
              <StageQuizCard
                careerId={careerId}
                stageId={quizStage.id}
                stageTitle={quizStage.title}
                complete={quizStageComplete}
              />
            )}
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
            // The next step may be in the next stage, so show whichever holds it.
            const home = next
              ? sections.find((section) => section.groups.some((group) => group.stepId === next.stepId))
              : undefined;
            if (home) setPickedId(home.id);
            setCompletedStepId(null);
          }}
        />
      )}
    </div>
  );
}
