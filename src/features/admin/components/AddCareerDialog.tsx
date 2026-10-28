import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Dialog } from "../../../components/ui/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/Select";
import { useAdminStore } from "../adminStore";
import { useAdminCareers } from "../hooks/useAdminCareers";

const BLANK = "blank";

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
      <AddCareerForm onClose={() => onOpenChange(false)} />
    </Dialog>
  );
}

function AddCareerForm({ onClose }: { onClose: () => void }) {
  const { rows } = useAdminCareers();
  const addCareer = useAdminStore((s) => s.addCareer);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [copyFrom, setCopyFrom] = useState(BLANK);

  const canSubmit = title.trim() !== "" && summary.trim() !== "";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    addCareer({
      title: title.trim(),
      shortDescription: summary.trim(),
      copyFrom: rows.find((r) => r.id === copyFrom),
    });
    onClose();
  };

  return (
    <form onSubmit={submit} className="mt-6 flex flex-col gap-5">
      <label className="flex flex-col gap-2 font-medium text-ink">
        Career name
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Technical Writer"
          className="field-control font-normal placeholder:text-ink-placeholder"
        />
      </label>

      <label className="flex flex-col gap-2 font-medium text-ink">
        One-line summary
        <input
          required
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Explains complex products in clear, useful words."
          className="field-control font-normal placeholder:text-ink-placeholder"
        />
      </label>

      <div className="flex flex-col gap-2">
        <span id="start-from-label" className="font-medium text-ink">
          Start from
        </span>
        <Select value={copyFrom} onValueChange={setCopyFrom}>
          <SelectTrigger aria-labelledby="start-from-label" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={BLANK}>Blank career</SelectItem>
            {rows.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-ink-muted">
          Or copy the skills and roadmap from an existing career.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={!canSubmit}>
          Create draft
        </Button>
        <Button isPrimary={false} onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
