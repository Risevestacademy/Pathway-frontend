import { useId, useState, type ReactNode } from "react";
import clsx from "clsx";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/Select";
import type { TopicOption } from "../admin.editor";

const labelClass = "flex flex-col gap-2 font-medium text-ink";
const inputClass = "field-control font-normal placeholder:text-ink-placeholder";

function FieldMessage({ error, hint }: { error?: string; hint?: ReactNode }) {
  if (error) {
    return (
      <span role="alert" className="text-sm font-normal text-danger-700">
        {error}
      </span>
    );
  }
  return hint ? (
    <span className="text-sm font-normal text-ink-muted">{hint}</span>
  ) : null;
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  type?: string;
  /** Suggestions for a "search or add" field. */
  suggestions?: string[];
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  error,
  hint,
  required,
  type = "text",
  suggestions,
}: TextFieldProps) {
  const listId = useId();
  return (
    <label className={labelClass}>
      {label}
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        list={suggestions ? listId : undefined}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className={clsx(inputClass, error && "!border-danger-600")}
      />
      {suggestions && (
        <datalist id={listId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
      <FieldMessage error={error} hint={hint} />
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: Pick<TextFieldProps, "label" | "value" | "onChange" | "placeholder">) {
  return (
    <label className={labelClass}>
      {label}
      <textarea
        value={value}
        placeholder={placeholder}
        rows={3}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(inputClass, "resize-none")}
      />
    </label>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <span id={id} className="font-medium text-ink">
        {label}
      </span>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as T)}
        disabled={disabled}
      >
        <SelectTrigger aria-labelledby={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Search roadmap topics and attach them; attached topics show as removable chips. */
export function TopicPicker({
  label,
  topics,
  value,
  onChange,
  placeholder = "Search topics to attach",
}: {
  label: string;
  topics: TopicOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const listId = useId();

  const selected = topics.filter((t) => value.includes(t.id));
  const q = query.trim().toLowerCase();
  const matches = topics
    .filter(
      (t) => !value.includes(t.id) && (!q || t.title.toLowerCase().includes(q)),
    )
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={`${listId}-input`} className="font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={`${listId}-input`}
          value={query}
          placeholder={topics.length ? placeholder : "No roadmap topics yet"}
          disabled={topics.length === 0}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          className={clsx(inputClass, "w-full disabled:opacity-60")}
        />
        {open && matches.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-line bg-surface p-1 shadow-raised">
            {matches.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  // Keeps focus on the input so the list doesn't close before the click.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange([...value, t.id]);
                    setQuery("");
                  }}
                  className="flex w-full flex-col rounded-md px-3 py-2 text-left text-sm hover:bg-surface-muted"
                >
                  <span className="text-ink">{t.title}</span>
                  <span className="text-xs text-ink-muted">{t.stageTitle}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {selected.map((t) => (
            <li
              key={t.id}
              className="inline-flex items-center gap-1 rounded-pill bg-brand-50 py-1 pr-1 pl-3 text-xs font-medium text-brand-700"
            >
              {t.title}
              <button
                type="button"
                aria-label={`Remove ${t.title}`}
                onClick={() => onChange(value.filter((id) => id !== t.id))}
                className="grid size-5 place-items-center rounded-pill hover:bg-brand-100 focus-ring"
              >
                <X className="size-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
