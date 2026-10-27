import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Dialog } from "../../../components/ui/Dialog";
import {
  COST_LABEL,
  RESOURCE_TYPE_LABEL,
  isValidUrl,
  newId,
  type ResourceCost,
  type ResourceItem,
  type ResourceType,
  type TopicOption,
} from "../admin.editor";
import { SelectField, TextAreaField, TextField, TopicPicker } from "./FormFields";

/** "new" adds a resource; a ResourceItem edits it; null keeps the dialog closed. */
export type ResourceDialogTarget = ResourceItem | "new" | null;

const TYPE_OPTIONS = (Object.keys(RESOURCE_TYPE_LABEL) as ResourceType[]).map((value) => ({
  value,
  label: RESOURCE_TYPE_LABEL[value],
}));
const COST_OPTIONS = (Object.keys(COST_LABEL) as ResourceCost[]).map((value) => ({
  value,
  label: COST_LABEL[value],
}));

interface ResourceDialogProps {
  target: ResourceDialogTarget;
  topics: TopicOption[];
  onSave: (resource: ResourceItem) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function ResourceDialog({ target, topics, onSave, onDelete, onClose }: ResourceDialogProps) {
  return (
    <Dialog
      open={target !== null}
      onOpenChange={(open) => !open && onClose()}
      title={target === "new" ? "Add a resource" : "Edit resource"}
      description="Learners see the title, cost and last-checked date. We check the link every week."
    >
      {target && (
        <ResourceForm
          key={target === "new" ? "new" : target.id}
          resource={target === "new" ? null : target}
          topics={topics}
          onSave={onSave}
          onDelete={onDelete}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
}

function ResourceForm({
  resource,
  topics,
  onSave,
  onDelete,
  onClose,
}: Omit<ResourceDialogProps, "target"> & { resource: ResourceItem | null }) {
  const [title, setTitle] = useState(resource?.title ?? "");
  const [url, setUrl] = useState(resource?.url ?? "");
  const [description, setDescription] = useState(resource?.description ?? "");
  const [type, setType] = useState<ResourceType>(resource?.type ?? "course");
  const [cost, setCost] = useState<ResourceCost>(resource?.cost ?? "free");
  const [topicIds, setTopicIds] = useState(resource?.topicIds ?? []);
  const [attempted, setAttempted] = useState(false);

  const titleError = title.trim() ? undefined : "Give the resource a title. Required.";
  const urlError = !url.trim()
    ? "Add the link. Required."
    : isValidUrl(url)
      ? undefined
      : "Enter a full link starting with https://";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (titleError || urlError) return;
    const linkChanged = url.trim() !== resource?.url;
    onSave({
      id: resource?.id ?? newId("resource"),
      title: title.trim(),
      url: url.trim(),
      description: description.trim(),
      type,
      cost,
      topicIds,
      // A new or changed link hasn't been checked yet.
      linkStatus: linkChanged || !resource ? "not-checked" : resource.linkStatus,
      lastChecked: linkChanged || !resource ? null : resource.lastChecked,
    });
  };

  return (
    <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-5">
      <TextField
        label="Title"
        value={title}
        onChange={setTitle}
        error={attempted ? titleError : undefined}
      />
      <TextField
        label="Link"
        type="url"
        value={url}
        onChange={setUrl}
        placeholder="https://"
        error={attempted ? urlError : undefined}
      />
      <TextAreaField label="Description" value={description} onChange={setDescription} />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField label="Type" value={type} onChange={setType} options={TYPE_OPTIONS} />
        <SelectField label="Cost" value={cost} onChange={setCost} options={COST_OPTIONS} />
      </div>
      <TopicPicker
        label="Used in topics"
        topics={topics}
        value={topicIds}
        onChange={setTopicIds}
      />
      <div className="flex flex-wrap gap-3">
        <Button type="submit">{resource ? "Save resource" : "Add resource"}</Button>
        <Button isPrimary={false} onClick={onClose}>
          Cancel
        </Button>
        {resource && (
          <Button
            isPrimary={false}
            className="ml-auto !text-danger-700"
            onClick={() => onDelete(resource.id)}
          >
            Delete resource
          </Button>
        )}
      </div>
    </form>
  );
}
