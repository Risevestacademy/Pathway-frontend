import { useId, useState } from "react";
import clsx from "clsx";
import { CheckRegular, CloseRegular } from "@mingcute/react/core-regular";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import type { OnboardingOption } from "../catalog.types";
import { HelperText } from "./HelperText";

interface SkillsInputProps {
  values: string[];
  options: OnboardingOption[];
  max: number;
  onChange: (values: string[]) => void;
  disabled?: boolean;
}

export function SkillsInput({
  values,
  options,
  max,
  onChange,
  disabled = false,
}: SkillsInputProps) {
  const [open, setOpen] = useState(false);
  const helperId = useId();
  const labelOf = (value: string) =>
    options.find((option) => option.value === value)?.label;

  const shown = values.filter((value) => labelOf(value) !== undefined);
  const atLimit = shown.length >= max;

  const toggle = (value: string) => {
    if (shown.includes(value)) {
      onChange(shown.filter((v) => v !== value));
    } else if (!atLimit) {
      onChange([...shown, value]);
    }
  };

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div
            className={clsx(
              "field-control flex min-h-10.5 flex-wrap items-center gap-2",
              disabled && "opacity-50",
            )}
          >
            {shown.map((value) => {
              const label = labelOf(value);
              if (!label) return null;
              return (
                <span
                  key={value}
                  className="inline-flex h-7 animate-in items-center gap-0.5 rounded-[4px] bg-brand-100 pr-1 pl-2 text-body-sm text-brand-700 duration-200 ease-out fade-in zoom-in-95 motion-reduce:animate-none"
                >
                  {label}
                  <button
                    type="button"
                    aria-label={`Remove ${label}`}
                    onClick={() => toggle(value)}
                    className="focus-ring relative grid size-4 cursor-pointer place-items-center rounded-xs after:absolute after:-inset-1 hover:bg-brand-200"
                  >
                    <CloseRegular size={16} aria-hidden />
                  </button>
                </span>
              );
            })}

            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                aria-label="Select skills"
                aria-describedby={helperId}
                className="min-h-6 min-w-24 flex-1 cursor-pointer text-left text-body-md text-ink-muted focus-visible:outline-none disabled:cursor-not-allowed"
              >
                {shown.length === 0 ? "Select skills" : ""}
              </button>
            </PopoverTrigger>
          </div>
        </PopoverAnchor>

        <PopoverContent
          align="start"
          sideOffset={4}
          className="max-h-72 w-(--radix-popover-trigger-width)! gap-0! overflow-y-auto rounded-lg border border-grey-50 bg-surface p-1! shadow-raised"
        >
          {options.map((option) => {
            const selected = shown.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                disabled={!selected && atLimit}
                onClick={() => toggle(option.value)}
                className="focus-ring flex h-10 w-full shrink-0 cursor-pointer items-center justify-between rounded-sm px-2.5 text-left text-body-md text-ink hover:bg-surface-muted focus-visible:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                {option.label}
                {selected && (
                  <CheckRegular
                    size={20}
                    aria-hidden
                    className="text-brand-600"
                  />
                )}
              </button>
            );
          })}
        </PopoverContent>
      </Popover>

      <HelperText id={helperId} aria-live="polite" className="mt-1">
        {atLimit
          ? `Limit reached: ${max} of ${max} skills`
          : `You can add up to ${max} skills`}
      </HelperText>
    </div>
  );
}
