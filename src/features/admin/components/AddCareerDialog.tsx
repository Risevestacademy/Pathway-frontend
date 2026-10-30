import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Dialog } from "../../../components/ui/Dialog";
import { CreateCareerError } from "../../../lib/api/adminCareers.api";
import { useFields } from "../../catalog/hooks/useFields";
import { TARGET_LEVEL_OPTIONS, slugify } from "../adminCareers.types";
import { useAdminStore } from "../adminStore";
import { useCreateCareer } from "../hooks/useCreateCareer";
import { SelectField, TextAreaField, TextField } from "./FormFields";

interface AddCareerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCareerDialog({ open, onOpenChange }: AddCareerDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add a career"
      description="It starts as a draft. Learners can’t see it until a second editor approves it."
    >
      {/* Mounted only while open, so the form resets each time. */}
      {open && <AddCareerForm onClose={() => onOpenChange(false)} />}
    </Dialog>
  );
}

function AddCareerForm({ onClose }: { onClose: () => void }) {
  const fields = useFields();
  const create = useCreateCareer();
  const addCareer = useAdminStore((s) => s.addCareer);

  const [title, setTitle] = useState("");
  const [slugInput, setSlugInput] = useState<string | null>(null);
  const [fieldId, setFieldId] = useState("");
  const [description, setDescription] = useState("");
  const [roleSummary, setRoleSummary] = useState("");
  const [levels, setLevels] = useState<string[]>([]);
  const [attempted, setAttempted] = useState(false);

  // The slug follows the name until the editor types their own.
  const slug = slugInput ?? slugify(title);
  // What is sent, without a dash left over from typing.
  const cleanSlug = slugify(slug);

  const serverCode = create.error instanceof CreateCareerError ? create.error.code : undefined;
  const errors = {
    title: !title.trim()
      ? "Add the career’s name."
      : serverCode === "CAREER_TITLE_TAKEN"
        ? create.error?.message
        : undefined,
    slug: !cleanSlug
      ? "Add a slug, using letters, numbers and dashes."
      : serverCode === "CAREER_SLUG_TAKEN"
        ? create.error?.message
        : undefined,
    field: !fieldId
      ? "Pick a field."
      : serverCode === "FIELD_NOT_FOUND"
        ? create.error?.message
        : undefined,
    description: !description.trim() ? "Add a one-line summary." : undefined,
    roleSummary: !roleSummary.trim() ? "Say what people in this role do." : undefined,
    levels: levels.length === 0 ? "Pick at least one." : undefined,
  };
  const hasErrors = Object.values(errors).some(Boolean);
  // A server error that belongs to no single field is shown above the buttons.
  const formError =
    create.isError &&
    !["CAREER_TITLE_TAKEN", "CAREER_SLUG_TAKEN", "FIELD_NOT_FOUND"].includes(serverCode ?? "")
      ? create.error.message
      : undefined;

  const toggleLevel = (value: string) =>
    setLevels((current) =>
      current.includes(value) ? current.filter((l) => l !== value) : [...current, value],
    );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (hasErrors) return;
    create.mutate(
      {
        title: title.trim(),
        slug: cleanSlug,
        fieldId,
        description: description.trim(),
        roleSummary: roleSummary.trim(),
        targetLevels: levels,
      },
      {
        onSuccess: (career) => {
          // The list shows careers from the public API, which has no drafts yet.
          addCareer({ id: career.id, title: career.title, shortDescription: career.description });
          onClose();
        },
      },
    );
  };

  // After a failed save, a server error stays visible even before the next attempt.
  const show = (message: string | undefined, fromServer: boolean) =>
    attempted || fromServer ? message : undefined;

  return (
    <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-5">
      <TextField
        label="Career name"
        value={title}
        onChange={setTitle}
        placeholder="Technical Writer"
        error={show(errors.title, serverCode === "CAREER_TITLE_TAKEN")}
      />

      <TextField
        label="Slug"
        value={slug}
        onChange={(value) => setSlugInput(value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))}
        placeholder="technical-writer"
        hint="Used in the career’s web address. Letters, numbers and dashes."
        error={show(errors.slug, serverCode === "CAREER_SLUG_TAKEN")}
      />

      {fields.isError ? (
        <div className="flex flex-col gap-2">
          <p role="alert" className="text-sm text-danger-700">
            We couldn’t load the fields.
          </p>
          <Button isPrimary={false} onClick={() => void fields.refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <SelectField
          label="Field"
          value={fieldId}
          onChange={setFieldId}
          options={(fields.data ?? []).map((f) => ({ value: f.id, label: f.name }))}
          placeholder={fields.isPending ? "Loading fields..." : "Pick a field"}
          error={show(errors.field, serverCode === "FIELD_NOT_FOUND")}
        />
      )}

      <TextField
        label="One-line summary"
        value={description}
        onChange={setDescription}
        placeholder="Explains complex products in clear, useful words."
        error={show(errors.description, false)}
      />

      <TextAreaField
        label="What they do"
        value={roleSummary}
        onChange={setRoleSummary}
        placeholder="Writes the guides and docs that help people use a product."
      />
      {attempted && errors.roleSummary && (
        <span role="alert" className="-mt-4 text-sm text-danger-700">
          {errors.roleSummary}
        </span>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="font-medium text-ink">Who it’s for</legend>
        {TARGET_LEVEL_OPTIONS.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-ink">
            <input
              type="checkbox"
              checked={levels.includes(option.value)}
              onChange={() => toggleLevel(option.value)}
            />
            {option.label}
          </label>
        ))}
        {attempted && errors.levels && (
          <span role="alert" className="text-sm text-danger-700">
            {errors.levels}
          </span>
        )}
      </fieldset>

      {formError && (
        <p role="alert" className="text-sm text-danger-700">
          {formError}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? "Creating..." : "Create draft"}
        </Button>
        <Button isPrimary={false} onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
