import clsx from "clsx";

export function RatingOption({
  name,
  value,
  label,
  checked,
  onSelect,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={clsx(
        "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors motion-reduce:transition-none",
        "has-focus-visible:ring-2 has-focus-visible:ring-brand-500 has-focus-visible:ring-offset-1",
        checked ? "border-brand-600 bg-brand-50" : "border-grey-100 bg-surface hover:bg-grey-50",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onSelect}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={clsx(
          "grid size-5 shrink-0 place-items-center rounded-full border-2",
          checked ? "border-brand-600" : "border-grey-300",
        )}
      >
        {checked && <span className="size-2.5 rounded-full bg-brand-600" />}
      </span>
      <span className="text-sm leading-5 text-ink">{label}</span>
    </label>
  );
}
