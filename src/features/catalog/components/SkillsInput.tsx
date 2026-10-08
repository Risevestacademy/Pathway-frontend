import { useId, useState } from "react";
import { CheckRegular, CloseRegular } from "@mingcute/react/core-regular";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HelperText } from "./HelperText";

interface SkillsInputProps {
  values: string[];
  options: string[];
  max: number;
  onChange: (values: string[]) => void;
}

export function SkillsInput({
  values,
  options,
  max,
  onChange,
}: SkillsInputProps) {
  const [open, setOpen] = useState(false);
  const helperId = useId();
  const atLimit = values.length >= max;

  const toggle = (skill: string) => {
    if (values.includes(skill)) {
      onChange(values.filter((v) => v !== skill));
    } else if (!atLimit) {
      onChange([...values, skill]);
    }
  };

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="field-control flex min-h-10.5 flex-wrap items-center gap-2">
            {values.map((skill) => (
              <span
                key={skill}
                className="inline-flex animate-in items-center gap-0.5 rounded-[4px] bg-brand-100 py-px pr-1 pl-2 text-body-md text-brand-700 duration-200 ease-out fade-in zoom-in-95 motion-reduce:animate-none"
              >
                {skill}
                <button
                  type="button"
                  aria-label={`Remove ${skill}`}
                  onClick={() => toggle(skill)}
                  className="focus-ring grid size-6 cursor-pointer place-items-center rounded-xs hover:bg-brand-200"
                >
                  <CloseRegular size={20} aria-hidden />
                </button>
              </span>
            ))}

            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Select skills"
                aria-describedby={helperId}
                className="min-h-6 min-w-24 flex-1 cursor-pointer text-left text-body-md text-ink-muted focus-visible:outline-none"
              >
                {values.length === 0 ? "Select skills" : ""}
              </button>
            </PopoverTrigger>
          </div>
        </PopoverAnchor>

        <PopoverContent
          align="start"
          sideOffset={4}
          className="w-(--radix-popover-trigger-width)! gap-0! rounded-lg border border-grey-50 bg-surface p-1! shadow-raised"
        >
          {options.map((skill) => {
            const selected = values.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                aria-pressed={selected}
                disabled={!selected && atLimit}
                onClick={() => toggle(skill)}
                className="focus-ring flex h-10 w-full cursor-pointer items-center justify-between rounded-sm px-2.5 text-left text-body-md text-ink hover:bg-surface-muted focus-visible:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                {skill}
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