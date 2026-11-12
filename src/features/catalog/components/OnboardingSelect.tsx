import { DownRegular } from "@mingcute/react/core-regular";
import { Select as SelectPrimitive } from "radix-ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/Select";

interface OnboardingSelectProps {
  id?: string;
  label?: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  className?: string;
  /** Where the option list renders; pass the dialog when used inside a Modal. */
  portalContainer?: HTMLElement | null;
}

export function OnboardingSelect({
  id,
  label,
  placeholder,
  value,
  onValueChange,
  options,
  disabled,
  className = "",
  portalContainer,
}: OnboardingSelectProps) {
  const accessibleName = label ?? (id ? undefined : placeholder);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        id={id}
        aria-label={accessibleName}
        className={`field-control flex min-h-10.5 cursor-pointer items-center justify-between gap-2 text-left text-body-md text-ink data-[state=open]:border-brand-500 data-placeholder:text-ink-muted disabled:cursor-not-allowed disabled:opacity-50 [&>span]:truncate ${className}`}
      >
        <SelectValue placeholder={placeholder} />
        <DownRegular
          size={20}
          aria-hidden
          className="shrink-0 text-ink-muted"
        />
      </SelectPrimitive.Trigger>

      <SelectContent
        position="popper"
        sideOffset={4}
        container={portalContainer}
        className="w-(--radix-select-trigger-width)"
      >
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
