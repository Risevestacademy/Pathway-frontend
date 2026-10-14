import clsx from "clsx";
import { DownRegular } from "@mingcute/react/core-regular";
import { Select as SelectPrimitive } from "radix-ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { filterPillClass } from "../catalog.styles";

interface FilterSelectProps {
  /** Shown before the value, e.g. "Level". */
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}

/** Catalogue filter dropdown, styled as an inactive tab pill. */
export function FilterSelect({
  label,
  placeholder,
  value,
  onValueChange,
  options,
  disabled,
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      {/* The visible "Label: value" text is the trigger's accessible name. */}
      <SelectPrimitive.Trigger
        className={clsx(
          filterPillClass(false),
          "flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <span>{label}:</span>
        <span className="text-ink">
          <SelectValue placeholder={placeholder} />
        </span>
        <DownRegular size={18} aria-hidden className="shrink-0" />
      </SelectPrimitive.Trigger>

      <SelectContent position="popper" sideOffset={4}>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="h-10 rounded-sm px-2.5 text-body-md"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
