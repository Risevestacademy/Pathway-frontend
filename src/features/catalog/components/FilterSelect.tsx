import clsx from "clsx";
import { DownRegular } from "@mingcute/react/core-regular";
import { Select as SelectPrimitive } from "radix-ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/Select";
import { filterPillClass } from "../catalog.styles";

interface FilterSelectProps {
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}

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
      <SelectPrimitive.Trigger
        className={clsx(
          filterPillClass(false),
          "flex max-w-full items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <span className="shrink-0">{label}:</span>
        <span className="min-w-0 truncate text-ink">
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
