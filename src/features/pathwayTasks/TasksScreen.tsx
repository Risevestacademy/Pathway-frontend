import { useState } from "react";
import { LinkButton } from "../../components/ui/Button";
import { Tag } from "../../components/ui/Tag";
import { CareerNotSavedError } from "../../lib/api/pathways.api";
import { OverviewHero } from "../pathwayRoadmap/components/OverviewHero";
import { OverviewTabs } from "../pathwayRoadmap/components/OverviewTabs";
import { ResourceSectionNav } from "../pathwayRoadmap/components/ResourceSectionNav";
import { BackLinkTo } from "../skillCheck/components/BackLink";
import type { TaskSection } from "./taskSections.utils";
import { useSetTaskCompletion } from "./useTaskMutations";

/** "4 weeks", or "1 week". */
const weeks = (count: number) => `${count} ${count === 1 ? "week" : "weeks"}`;

/** One career's practice tasks: the stages down the side, and the one picked shown beside them. */
export function TasksScreen({
  careerId,
  careerTitle,
  stepCount,
  pathwayId,
  sections,
}: {
  careerId: string;
  careerTitle: string;
  stepCount: number;
  pathwayId: string;
  sections: TaskSection[];
}) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const completion = useSetTaskCompletion(pathwayId);

  // Until one is picked, or if the one picked has gone, it is the first stage.
  const selected = sections.find((section) => section.id === pickedId) ?? sections[0];
  const saving = completion.isPending ? completion.variables?.taskId : undefined;

  return (
    <div className="flex flex-col gap-6">
      <BackLinkTo to="/my-pathway" label="Back" />
      <OverviewHero title={careerTitle} stepCount={stepCount} stageCount={sections.length} />
      <OverviewTabs careerId={careerId} current="tasks" />

      {!selected ? (
        <p className="text-sm text-ink-muted">No practice tasks for this roadmap yet</p>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
          <ResourceSectionNav
            label="Stages"
            emptyLabel="No tasks"
            items={sections.map((section) => ({
              id: section.id,
              title: section.title,
              ticked: section.done,
              total: section.total,
            }))}
            selectedId={selected.id}
            onSelect={setPickedId}
          />

          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h2 className="font-display text-3xl font-medium text-ink">{selected.title}</h2>
              <p className="text-base text-ink-muted">
                {selected.done} of {selected.total} steps complete
              </p>
            </div>

            <p className="rounded-2xl bg-grey-50 px-5 py-4 text-sm text-ink">
              Each task is a brief you can follow alone. Tick a task when you decide it is done. It is
              your own record.
            </p>

            {completion.isError && (
              <p role="alert" className="text-sm text-danger-700">
                {completion.error instanceof CareerNotSavedError
                  ? "Start tracking this pathway to save your progress."
                  : "We couldn’t save that. Try again."}
              </p>
            )}

            {selected.steps.length === 0 ? (
              <p className="rounded-3xl border border-line bg-surface p-6 text-sm text-ink-muted">
                No practice tasks in this stage yet
              </p>
            ) : (
              <ul
                aria-label="Tasks"
                className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface"
              >
                {selected.steps.flatMap((step) =>
                  step.tasks.map((task) => (
                    <li key={task.id} className="flex flex-wrap items-center gap-4 px-6 py-5">
                      <input
                        type="checkbox"
                        aria-label={`Mark ${task.title} as done`}
                        checked={task.isCompleted}
                        disabled={saving === task.id}
                        onChange={() =>
                          completion.mutate({ taskId: task.id, completed: !task.isCompleted })
                        }
                        className="focus-ring size-6 shrink-0 cursor-pointer rounded-md border border-line-strong accent-brand-600 disabled:cursor-wait"
                      />
                      <div className="flex min-w-0 flex-1 basis-64 flex-col gap-1">
                        <p className="text-sm text-brand-700">Step {step.number}</p>
                        <p className="text-lg font-medium text-ink">{step.title}</p>
                        <p className="text-base text-ink-muted">{task.title}</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <Tag tone="success">Task</Tag>
                          <Tag tone="neutral">{weeks(task.estimatedWeeks)}</Tag>
                        </div>
                      </div>
                      <LinkButton
                        to="/my-pathway/$careerId/tasks/$taskId"
                        params={{ careerId, taskId: task.id }}
                        isPrimary={false}
                      >
                        View brief
                      </LinkButton>
                    </li>
                  )),
                )}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
