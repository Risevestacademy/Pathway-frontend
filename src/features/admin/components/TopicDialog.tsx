import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Dialog } from "../../../components/ui/Dialog";
import {
  newId,
  type RoadmapStage,
  type RoadmapTopic,
  type SkillItem,
} from "../admin.editor";
import { SelectField, TextField } from "./FormFields";

/** "new" adds a topic; a RoadmapTopic edits it; null keeps the dialog closed. */
export type TopicDialogTarget = RoadmapTopic | "new" | null;

const NEW_STAGE = "__new__";
const NO_SKILL = "__none__";

interface TopicDialogProps {
  target: TopicDialogTarget;
  stages: RoadmapStage[];
  skills: SkillItem[];
  /** newStageTitle is set when the topic goes into a stage created here. */
  onSave: (topic: RoadmapTopic, stageId: string, newStageTitle: string | null) => void;
  onDelete: (topicId: string) => void;
  onClose: () => void;
}

export function TopicDialog({ target, stages, skills, onSave, onDelete, onClose }: TopicDialogProps) {
  return (
    <Dialog
      open={target !== null}
      onOpenChange={(open) => !open && onClose()}
      title={target === "new" ? "Add a topic" : "Edit topic"}
      description="Topics are what learners work through, in stage order."
    >
      {target && (
        <TopicForm
          key={target === "new" ? "new" : target.id}
          topic={target === "new" ? null : target}
          stages={stages}
          skills={skills}
          onSave={onSave}
          onDelete={onDelete}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
}

function TopicForm({
  topic,
  stages,
  skills,
  onSave,
  onDelete,
  onClose,
}: Omit<TopicDialogProps, "target"> & { topic: RoadmapTopic | null }) {
  const currentStage = topic
    ? stages.find((s) => s.topics.some((t) => t.id === topic.id))?.id
    : undefined;
  const [title, setTitle] = useState(topic?.title ?? "");
  const [stageId, setStageId] = useState(
    currentStage ?? stages[0]?.id ?? NEW_STAGE,
  );
  const [newStage, setNewStage] = useState("");
  const [skillId, setSkillId] = useState(topic?.skillId ?? NO_SKILL);

  const creatingStage = stageId === NEW_STAGE;
  const canSubmit = title.trim() !== "" && (!creatingStage || newStage.trim() !== "");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSave(
      {
        id: topic?.id ?? newId("topic"),
        title: title.trim(),
        skillId: skillId === NO_SKILL ? null : skillId,
      },
      stageId,
      creatingStage ? newStage.trim() : null,
    );
  };

  return (
    <form onSubmit={submit} className="mt-6 flex flex-col gap-5">
      <TextField label="Topic title" required value={title} onChange={setTitle} />
      <SelectField
        label="Stage"
        value={stageId}
        onChange={setStageId}
        options={[
          ...stages.map((s, i) => ({ value: s.id, label: `Stage ${i + 1} · ${s.title}` })),
          { value: NEW_STAGE, label: "New stage…" },
        ]}
      />
      {creatingStage && (
        <TextField
          label="New stage name"
          required
          value={newStage}
          onChange={setNewStage}
          placeholder="Foundations"
        />
      )}
      <SelectField
        label="Teaches skill"
        value={skillId}
        onChange={setSkillId}
        options={[
          { value: NO_SKILL, label: "No skill" },
          ...skills.map((s) => ({ value: s.id, label: s.name })),
        ]}
      />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={!canSubmit}>
          {topic ? "Save topic" : "Add topic"}
        </Button>
        <Button isPrimary={false} onClick={onClose}>
          Cancel
        </Button>
        {topic && (
          <Button
            isPrimary={false}
            className="ml-auto !text-danger-700"
            onClick={() => onDelete(topic.id)}
          >
            Delete topic
          </Button>
        )}
      </div>
    </form>
  );
}
