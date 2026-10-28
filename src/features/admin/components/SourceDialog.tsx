import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Dialog } from "../../../components/ui/Dialog";
import {
  SOURCE_TYPES,
  SOURCE_USED_FOR,
  isValidUrl,
  newId,
  type SourceItem,
} from "../admin.editor";
import { SelectField, TextField } from "./FormFields";

/** "new" adds a source; a SourceItem edits it; null keeps the dialog closed. */
export type SourceDialogTarget = SourceItem | "new" | null;

const toOptions = (values: string[]) => values.map((v) => ({ value: v, label: v }));

interface SourceDialogProps {
  target: SourceDialogTarget;
  onSave: (source: SourceItem) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function SourceDialog({ target, onSave, onDelete, onClose }: SourceDialogProps) {
  return (
    <Dialog
      open={target !== null}
      onOpenChange={(open) => !open && onClose()}
      title={target === "new" ? "Add a source" : "Edit source"}
      description="Learners see sources under “Where this comes from”. A source needs a link so they can check it."
    >
      {target && (
        <SourceForm
          key={target === "new" ? "new" : target.id}
          source={target === "new" ? null : target}
          onSave={onSave}
          onDelete={onDelete}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
}

function SourceForm({
  source,
  onSave,
  onDelete,
  onClose,
}: Omit<SourceDialogProps, "target"> & { source: SourceItem | null }) {
  const [title, setTitle] = useState(source?.title ?? "");
  const [link, setLink] = useState(source?.link ?? "");
  const [usedFor, setUsedFor] = useState(source?.usedFor ?? SOURCE_USED_FOR[0]);
  const [type, setType] = useState(source?.type ?? SOURCE_TYPES[0]);
  const [attempted, setAttempted] = useState(false);

  const titleError = title.trim() ? undefined : "Give the source a name. Required.";
  // A link is optional here, but it blocks submitting until one is added.
  const linkError =
    link.trim() && !isValidUrl(link) ? "Enter a full link starting with https://" : undefined;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (titleError || linkError) return;
    const linkChanged = link.trim() !== (source?.link ?? "");
    onSave({
      id: source?.id ?? newId("source"),
      title: title.trim(),
      link: link.trim(),
      usedFor,
      type,
      // A new or changed link hasn't been checked yet.
      lastChecked: linkChanged ? (link.trim() ? new Date().toISOString() : null) : source?.lastChecked ?? null,
    });
  };

  return (
    <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-5">
      <TextField
        label="Source name"
        value={title}
        onChange={setTitle}
        error={attempted ? titleError : undefined}
      />
      <TextField
        label="Link"
        type="url"
        value={link}
        onChange={setLink}
        placeholder="https://"
        error={attempted ? linkError : undefined}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Used for"
          value={usedFor}
          onChange={setUsedFor}
          options={toOptions(SOURCE_USED_FOR)}
        />
        <SelectField label="Type" value={type} onChange={setType} options={toOptions(SOURCE_TYPES)} />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="submit">{source ? "Save source" : "Add source"}</Button>
        <Button isPrimary={false} onClick={onClose}>
          Cancel
        </Button>
        {source && (
          <Button
            isPrimary={false}
            className="ml-auto !text-danger-700"
            onClick={() => onDelete(source.id)}
          >
            Delete source
          </Button>
        )}
      </div>
    </form>
  );
}
