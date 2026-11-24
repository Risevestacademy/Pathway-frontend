import { useId, type ReactNode } from "react";
import { Button, LinkButton } from "../../components/ui/Button";
import { Tag } from "../../components/ui/Tag";
import { CareerNotSavedError } from "../../lib/api/pathways.api";
import type { PathwayCostStatus } from "../../lib/api/pathways.api";
import type { PathwayTaskDetailDto } from "../../lib/api/pathwayTasks.api";
import { ReportIssueLink } from "../feedback/components/ReportIssueLink";
import { KIND_LABEL } from "../pathwayRoadmap/resourceLabels";
import { resourceKindMap } from "../resources/resources.utils";
import { BackLinkTo } from "../skillCheck/components/BackLink";
import { useSetChecklistItem, useSetTaskCompletion } from "./useTaskMutations";

const COST_LABEL: Record<PathwayCostStatus, string> = {
  FREE: "Free",
  PAID: "Paid",
  UNKNOWN: "Cost unknown",
};

const weeks = (count: number) => `${count} ${count === 1 ? "week" : "weeks"}`;

function Card({ title, children }: { title: string; children: ReactNode }) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="rounded-3xl border border-line bg-surface p-6">
      <h2 id={headingId} className="font-display text-xl font-medium text-ink">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="flex flex-col gap-4 rounded-2xl border border-line p-5">
      {items.map((item, index) => (
        <li key={`${index}-${item}`} className="flex items-center gap-4 text-base text-ink">
          <span
            aria-hidden
            className="grid size-8 shrink-0 place-items-center rounded-lg border border-brand-200 bg-brand-50 text-sm text-brand-700"
          >
            {index + 1}
          </span>
          {item}
        </li>
      ))}
    </ol>
  );
}

/** One practice task's brief: what to make, hints, links, and a checklist to judge their own work. */
export function TaskBriefScreen({
  careerId,
  careerTitle,
  pathwayId,
  stage,
  step,
  task,
}: {
  careerId: string;
  careerTitle: string;
  pathwayId: string;
  /** The stage and step the task sits under, or null when they can't be named. */
  stage: { id: string; title: string } | null;
  step: { id: string; number: number; title: string } | null;
  task: PathwayTaskDetailDto;
}) {
  const checkId = useId();
  const completion = useSetTaskCompletion(pathwayId);
  const checklist = useSetChecklistItem(pathwayId, task.id);

  const savingItem =
    checklist.isPending && checklist.variables ? checklist.variables.itemId : undefined;
  const failure = completion.isError ? completion.error : checklist.isError ? checklist.error : null;
  const failed = completion.isError || checklist.isError;

  const eyebrow = [stage?.title, step ? `Step ${step.number}` : null, step?.title]
    .filter(Boolean)
    .join(" · ");
  const about = [careerTitle, step?.title ?? task.title].join(" · ");

  return (
    <div className="flex flex-col gap-6">
      <BackLinkTo to="/my-pathway/$careerId/tasks" params={{ careerId }} label="Back" />

      <header className="flex flex-col gap-3">
        {eyebrow && <p className="text-brand-700">{eyebrow}</p>}
        <h1 className="font-display text-3xl leading-10 font-semibold text-ink sm:text-4xl">
          {step?.title ?? task.title}
        </h1>
        <div className="flex flex-wrap gap-2">
          <Tag tone="success" className="px-3 py-2 text-sm">
            Task
          </Tag>
          <Tag tone="neutral" className="px-3 py-2 text-sm">
            {weeks(task.estimatedWeeks)}
          </Tag>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          {task.goal.trim() && (
            <Card title="Goal">
              <p className="rounded-2xl border border-line p-5 text-base text-ink">{task.goal}</p>
            </Card>
          )}
          {task.whatToMake.length > 0 && (
            <Card title="What to make">
              <NumberedList items={task.whatToMake} />
            </Card>
          )}
          {task.hints.length > 0 && (
            <Card title="Hints">
              <NumberedList items={task.hints} />
            </Card>
          )}
          {task.helpfulLinks.length > 0 && (
            <Card title="Helpful links">
              <ul className="flex flex-col gap-3">
                {task.helpfulLinks.map((link) => (
                  <li
                    key={link.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-grey-50 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="text-base font-medium text-ink">{link.title}</p>
                      <p className="text-sm text-ink-muted">
                        by {link.provider} · {KIND_LABEL[resourceKindMap[link.type]]} ·{" "}
                        {COST_LABEL[link.costStatus]}
                      </p>
                    </div>
                    <LinkButton
                      to="/my-pathway/$careerId/resources/$resourceId"
                      params={{ careerId, resourceId: link.id }}
                      isPrimary={false}
                    >
                      View details
                    </LinkButton>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <section
          aria-labelledby={checkId}
          className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-6"
        >
          <div>
            <h2 id={checkId} className="font-display text-xl font-medium text-ink">
              Check your own work
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Use this list to decide for yourself whether the task is done.
            </p>
          </div>

          {task.checklist.length > 0 && (
            <ul className="flex flex-col gap-3">
              {task.checklist.map((item) => (
                <li key={item.id}>
                  <label className="flex cursor-pointer items-center gap-3 text-base text-ink">
                    <input
                      type="checkbox"
                      checked={item.isChecked}
                      disabled={savingItem === item.id}
                      onChange={() => checklist.mutate({ itemId: item.id, checked: !item.isChecked })}
                      className="focus-ring size-6 shrink-0 cursor-pointer rounded-md border border-line-strong accent-brand-600 disabled:cursor-wait"
                    />
                    {item.text}
                  </label>
                </li>
              ))}
            </ul>
          )}

          {failed && (
            <p role="alert" className="text-sm text-danger-700">
              {failure instanceof CareerNotSavedError
                ? "Start tracking this pathway to save your progress."
                : "We couldn’t save that. Try again."}
            </p>
          )}

          <div className="flex flex-col gap-3 border-t border-line pt-4">
            {task.isCompleted ? (
              <>
                <p className="text-sm font-medium text-success-700">You marked this task done.</p>
                <Button
                  isPrimary={false}
                  className="w-fit"
                  disabled={completion.isPending}
                  onClick={() => completion.mutate({ taskId: task.id, completed: false })}
                >
                  {completion.isPending ? "Saving" : "Mark task as not done"}
                </Button>
              </>
            ) : (
              <Button
                className="w-fit"
                disabled={completion.isPending}
                onClick={() => completion.mutate({ taskId: task.id, completed: true })}
              >
                {completion.isPending ? "Saving" : "Mark task as done"}
              </Button>
            )}
            <p className="text-sm text-ink-muted">
              We do not collect or mark your work. You decide when it is done.
            </p>
          </div>

          <ReportIssueLink
            section="PATHWAY"
            careerId={careerId}
            subject={task.title}
            about={about}
          />
        </section>
      </div>
    </div>
  );
}
