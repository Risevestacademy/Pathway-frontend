import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Dialog } from "../../../components/ui/Dialog";
import { newId, type Importance, type SkillItem, type TopicOption } from "../admin.editor";
import { SelectField, TextAreaField, TextField, TopicPicker } from "./FormFields";

/** "new" adds a skill; a SkillItem edits it; null keeps the dialog closed. */
export type SkillDialogTarget = SkillItem | "new" | null;

interface SkillDialogProps {
  target: SkillDialogTarget;
  topics: TopicOption[];
  sourceTitles: string[];
  onSave: (skill: SkillItem) => void;
  onClose: () => void;
}

export function SkillDialog({ target, topics, sourceTitles, onSave, onClose }: SkillDialogProps) {
  return (
    <Dialog
      open={target !== null}
      onOpenChange={(open) => !open && onClose()}
      title={target === "new" ? "Add a skill" : "Edit skill"}
      description="Learners see the name and description when they check their skill gap."
    >
      {target && (
        <SkillForm
          key={target === "new" ? "new" : target.id}
          skill={target === "new" ? null : target}
          topics={topics}
          sourceTitles={sourceTitles}
          onSave={onSave}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
}

function SkillForm({
  skill,
  topics,
  sourceTitles,
  onSave,
  onClose,
}: {
  skill: SkillItem | null;
  topics: TopicOption[];
  sourceTitles: string[];
  onSave: (skill: SkillItem) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(skill?.name ?? "");
  const [description, setDescription] = useState(skill?.description ?? "");
  const [importance, setImportance] = useState<Importance>(skill?.importance ?? "required");
  const [topicIds, setTopicIds] = useState(skill?.topicIds ?? []);
  const [source, setSource] = useState(skill?.source ?? "");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: skill?.id ?? newId("skill"),
      name: name.trim(),
      description: description.trim(),
      importance,
      topicIds,
      source: source.trim(),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={submit} className="mt-6 flex flex-col gap-5">
      <TextField label="Skill name" required value={name} onChange={setName} />
      <TextAreaField label="Description" value={description} onChange={setDescription} />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Importance"
          value={importance}
          onChange={setImportance}
          options={[
            { value: "required", label: "Required" },
            { value: "nice", label: "Nice to have" },
          ]}
        />
        <TopicPicker
          label="Roadmap topics"
          topics={topics}
          value={topicIds}
          onChange={setTopicIds}
        />
      </div>
      <TextField
        label="Source"
        value={source}
        onChange={setSource}
        placeholder="Search or add a source"
        suggestions={sourceTitles}
        hint="Every skill needs a source before it can be published."
      />
      <div className="flex gap-3">
        <Button type="submit" disabled={!name.trim()}>
          {skill ? "Save skill" : "Add skill"}
        </Button>
        <Button isPrimary={false} onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
