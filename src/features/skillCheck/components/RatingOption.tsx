import clsx from "clsx";
import { CheckRegular } from "@mingcute/react/core-regular";

export function RatingOption({
  name,
  value,
  label,
  prefix,
  checked,
  onSelect,
}: {
  name: string;
  value: string;
  label: string;
  prefix: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={clsx(
        "flex cursor-pointer items-center gap-3 rounded-[10px] border p-4 transition-colors duration-200 ease-out motion-reduce:transition-none",
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
        className="sr-only"
      />
      <span
        aria-hidden
        className={clsx(
          "grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors duration-200 motion-reduce:transition-none",
          checked ? "border-brand-600 bg-brand-600 text-brand-200" : "border-grey-200 bg-surface",
        )}
      >
        {checked && <CheckRegular className="size-3" />}
      </span>
      <span className="flex flex-wrap items-center gap-1 text-sm leading-5">
        <span className="font-medium text-ink">{prefix}</span>
        <span className="text-grey-600">{label}</span>
      </span>
    </label>
  );
}
