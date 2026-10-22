import { useState } from "react";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { StateMessage } from "../../../components/ui/StateMessage";
import {
  countTopics,
  type ResourceItem,
  type RoadmapStage,
  type RoadmapTopic,
  type SkillItem,
} from "../admin.editor";
import { TopicDialog, type TopicDialogTarget } from "./TopicDialog";

function move<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

interface RoadmapTabProps {
  stages: RoadmapStage[];
  skills: SkillItem[];
  resources: ResourceItem[];
  onChange: (stages: RoadmapStage[]) => void;
}

export function RoadmapTab({ stages, skills, resources, onChange }: RoadmapTabProps) {
  const [openIds, setOpenIds] = useState<string[]>(() => (stages[0] ? [stages[0].id] : []));
  const [reordering, setReordering] = useState(false);
  const [target, setTarget] = useState<TopicDialogTarget>(null);

  const skillName = (id: string | null) => skills.find((s) => s.id === id)?.name;
  const resourceCount = (topicId: string) =>
    resources.filter((r) => r.topicIds.includes(topicId)).length;

  const toggle = (id: string) =>
    setOpenIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));

  const moveTopic = (stageIndex: number, from: number, to: number) =>
    onChange(
      stages.map((s, i) => (i === stageIndex ? { ...s, topics: move(s.topics, from, to) } : s)),
    );

  const saveTopic = (topic: RoadmapTopic, stageId: string, newStageTitle: string | null) => {
    // Remove the topic from wherever it was, then place it in its stage.
    let next = stages.map((s) => ({ ...s, topics: s.topics.filter((t) => t.id !== topic.id) }));
    const previousStage =
      target && target !== "new"
        ? stages.find((s) => s.topics.some((t) => t.id === target.id))?.id
        : undefined;

    let stageKey = stageId;
    if (newStageTitle !== null) {
      stageKey = `stage-${crypto.randomUUID()}`;
      next = [...next, { id: stageKey, title: newStageTitle, topics: [] }];
    }

    if (previousStage === stageKey) {
      // Same stage: keep the topic's position.
      next = stages.map((s) =>
        s.id === stageKey
          ? { ...s, topics: s.topics.map((t) => (t.id === topic.id ? topic : t)) }
          : s,
      );
    } else {
      next = next.map((s) => (s.id === stageKey ? { ...s, topics: [...s.topics, topic] } : s));
    }
    onChange(next);
    setOpenIds((ids) => (ids.includes(stageKey) ? ids : [...ids, stageKey]));
    setTarget(null);
  };

  const deleteTopic = (topicId: string) => {
    onChange(
      stages.map((s) => ({ ...s, topics: s.topics.filter((t) => t.id !== topicId) })),
    );
    setTarget(null);
  };

  const total = countTopics(stages);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Roadmap</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {total} topic{total === 1 ? "" : "s"} in {stages.length} stage
            {stages.length === 1 ? "" : "s"}. Learners see stages in this order.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            isPrimary={false}
            aria-pressed={reordering}
            disabled={total < 2}
            onClick={() => setReordering((r) => !r)}
          >
            {reordering ? "Done" : "Reorder"}
          </Button>
          <Button onClick={() => setTarget("new")}>Add topic</Button>
        </div>
      </div>

      {stages.length === 0 ? (
        <section className="rounded-3xl border border-line-strong">
          <StateMessage
            kind="empty"
            title="No roadmap yet"
            body="Add the first topic to start this career’s roadmap."
            action={<Button onClick={() => setTarget("new")}>Add topic</Button>}
          />
        </section>
      ) : (
        <div className="flex flex-col gap-4">
          {stages.map((stage, stageIndex) => {
            const open = openIds.includes(stage.id) || reordering;
            const heading = `Stage ${stageIndex + 1} · ${stage.title}`;
            const count = `${stage.topics.length} topic${stage.topics.length === 1 ? "" : "s"}`;

            if (!open) {
              return (
                <section
                  key={stage.id}
                  className="flex items-center justify-between gap-4 rounded-3xl border border-line-strong px-6 py-5"
                >
                  <h3 className="font-medium text-ink">{heading}</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-ink-muted">{count}</span>
                    <Button
                      isPrimary={false}
                      aria-expanded={false}
                      onClick={() => toggle(stage.id)}
                    >
                      Open
                    </Button>
                  </div>
                </section>
              );
            }

            return (
              <section
                key={stage.id}
                className="overflow-hidden rounded-3xl border border-line-strong"
              >
                <div className="flex items-center justify-between gap-4 bg-brand-50 px-6 py-4">
                  <div>
                    <h3 className="font-medium text-ink">{heading}</h3>
                    <p className="mt-0.5 text-sm text-ink-muted">{count}</p>
                  </div>
                  {reordering ? (
                    <div className="flex gap-2">
                      <Button
                        isPrimary={false}
                        aria-label={`Move ${heading} up`}
                        disabled={stageIndex === 0}
                        onClick={() => onChange(move(stages, stageIndex, stageIndex - 1))}
                      >
                        <ArrowUp className="size-4" aria-hidden />
                      </Button>
                      <Button
                        isPrimary={false}
                        aria-label={`Move ${heading} down`}
                        disabled={stageIndex === stages.length - 1}
                        onClick={() => onChange(move(stages, stageIndex, stageIndex + 1))}
                      >
                        <ArrowDown className="size-4" aria-hidden />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      isPrimary={false}
                      aria-expanded
                      onClick={() => toggle(stage.id)}
                    >
                      Close
                    </Button>
                  )}
                </div>
                {stage.topics.length === 0 ? (
                  <p className="border-t border-line px-6 py-5 text-sm text-ink-muted">
                    No topics in this stage yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-line border-t border-line">
                    {stage.topics.map((topic, topicIndex) => {
                      const teaches = skillName(topic.skillId);
                      const resourcesN = resourceCount(topic.id);
                      return (
                        <li key={topic.id} className="flex items-center gap-4 px-6 py-4">
                          {reordering ? (
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                aria-label={`Move ${topic.title} up`}
                                disabled={topicIndex === 0}
                                onClick={() => moveTopic(stageIndex, topicIndex, topicIndex - 1)}
                                className="grid size-6 place-items-center rounded text-ink-muted hover:bg-surface-muted disabled:opacity-30 focus-ring"
                              >
                                <ArrowUp className="size-4" aria-hidden />
                              </button>
                              <button
                                type="button"
                                aria-label={`Move ${topic.title} down`}
                                disabled={topicIndex === stage.topics.length - 1}
                                onClick={() => moveTopic(stageIndex, topicIndex, topicIndex + 1)}
                                className="grid size-6 place-items-center rounded text-ink-muted hover:bg-surface-muted disabled:opacity-30 focus-ring"
                              >
                                <ArrowDown className="size-4" aria-hidden />
                              </button>
                            </div>
                          ) : (
                            <GripVertical className="size-5 shrink-0 text-ink-subtle" aria-hidden />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-ink">{topic.title}</p>
                            {teaches && (
                              <p className="text-sm text-ink-muted">Teaches: {teaches}</p>
                            )}
                          </div>
                          <span className="text-sm text-ink-muted">
                            {resourcesN} resource{resourcesN === 1 ? "" : "s"}
                          </span>
                          {!reordering && (
                            <Button isPrimary={false} onClick={() => setTarget(topic)}>
                              Edit
                            </Button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      <TopicDialog
        target={target}
        stages={stages}
        skills={skills}
        onSave={saveTopic}
        onDelete={deleteTopic}
        onClose={() => setTarget(null)}
      />
    </div>
  );
}
