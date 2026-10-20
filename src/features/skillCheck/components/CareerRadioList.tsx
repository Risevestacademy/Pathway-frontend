import clsx from "clsx";
import { CheckRegular } from "@mingcute/react/core-regular";
import { TrackIcon } from "../../../components/TrackIcon";
import type { SkillCheckCareerSummary } from "../skillCheck.types";
import { ReviewTag, Tag } from "./Tag";

export function CareerRadioList({
  careers,
  value,
  onChange,
  name,
  legend,
  showIcons = false,
}: {
  careers: SkillCheckCareerSummary[];
  value: string | null;
  onChange: (careerId: string) => void;
  name: string;
  legend: string;
  showIcons?: boolean;
}) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-3 border-0 p-0">
      <legend className="sr-only">{legend}</legend>
      {careers.map((career) => {
        const selected = value === career.careerId;
        return (
          <label
            key={career.careerId}
            className={clsx(
              "relative flex cursor-pointer items-center justify-between gap-3 rounded-[10px] border px-4 py-3 transition-colors duration-200 ease-out motion-reduce:transition-none",
              "has-focus-visible:ring-2 has-focus-visible:ring-brand-500",
              selected
                ? "border-brand-600 bg-brand-50"
                : "border-grey-100 bg-surface hover:bg-grey-50",
            )}
          >
            <input
              type="radio"
              name={name}
              value={career.careerId}
              checked={selected}
              onChange={() => onChange(career.careerId)}
              className="peer sr-only"
            />
            <span className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden
                className={clsx(
                  "grid size-5 shrink-0 place-items-center rounded-md border-[1.5px] transition-colors motion-reduce:transition-none",
                  selected
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-grey-200 bg-surface",
                )}
              >
                {selected && <CheckRegular className="size-3.5" />}
              </span>
              {showIcons && <TrackIcon icon={career.icon} size={32} />}
              <span className="min-w-0 text-base leading-5 font-medium text-ink">
                {career.name}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              {career.isActive && <Tag tone="brand" className="font-medium">Active pathway</Tag>}
              {!career.isActive && <ReviewTag reviewed={career.reviewed} />}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
