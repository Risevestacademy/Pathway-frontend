import clsx from "clsx";
import { Check, ListFilter, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { landingButtonStyles } from "@/features/landing/landingButton.styles";
import type { CareerField } from "@/features/catalog/catalog.types";
import { CAREER_LEVELS, type CareerLevel } from "@/types/career.types";
import { EXPLORE_LIST } from "../explore.copy";

interface CareerFiltersProps {
  query: string;
  level: CareerLevel | undefined;
  field: string | undefined;
  fields: CareerField[];
  onQueryChange: (value: string) => void;
  onLevelChange: (value: CareerLevel | undefined) => void;
  onFieldChange: (value: string | undefined) => void;
}

const chipBase =
  "focus-ring inline-flex h-10 cursor-pointer items-center rounded-[8px] border-b-[3px] px-3 font-landing-body text-[15px] font-medium whitespace-nowrap transition-colors duration-150 motion-reduce:transition-none";

/**
 * Search box, field filter and career-stage chips. Stage and field are sent
 * to the API (`level`, `interest`); the search box filters the returned list.
 */
export default function CareerFilters({
  query,
  level,
  field,
  fields,
  onQueryChange,
  onLevelChange,
  onFieldChange,
}: CareerFiltersProps) {
  const fieldName = fields.find((f) => f.slug === field)?.name;
  const chips: { id: CareerLevel | undefined; label: string }[] = [
    { id: undefined, label: EXPLORE_LIST.allLevels },
    ...CAREER_LEVELS.map((l) => ({ id: l.id, label: l.label })),
  ];

  return (
    <div className="mx-auto w-full max-w-[740px]">
      <div className="flex gap-3">
        <label className="relative flex-1">
          <span className="sr-only">{EXPLORE_LIST.searchLabel}</span>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-grey-500" strokeWidth={1.75} />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={EXPLORE_LIST.searchPlaceholder}
            className="h-[62px] w-full rounded-[12px] border border-grey-100 bg-white pr-4 pl-14 font-landing-body text-base text-ink transition-colors outline-none placeholder:text-grey-500 hover:border-grey-200 focus-visible:border-brand-500 focus-visible:ring-3 focus-visible:ring-brand-500/15 motion-reduce:transition-none"
          />
        </label>

        <Popover>
          <PopoverTrigger
            className={landingButtonStyles({
              variant: "primary",
              size: "lg",
              className: "h-[62px] shrink-0 px-5 sm:px-6",
            })}
          >
            <ListFilter aria-hidden className="size-5" strokeWidth={1.75} />
            <span className="hidden sm:inline">{EXPLORE_LIST.filter}</span>
            {fieldName && (
              <span className="grid size-5 place-items-center rounded-full bg-white text-xs font-semibold text-brand-600">
                1<span className="sr-only"> filter applied: {fieldName}</span>
              </span>
            )}
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 gap-2 rounded-xl p-2 font-landing-body">
            <p className="px-2 pt-1 text-sm font-medium text-grey-500">{EXPLORE_LIST.fieldHeading}</p>
            <ul role="listbox" aria-label={EXPLORE_LIST.fieldHeading} className="flex flex-col">
              {[{ slug: undefined, name: EXPLORE_LIST.anyField }, ...fields].map((option) => {
                const selected = option.slug === field;
                return (
                  <li key={option.slug ?? "any"}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => onFieldChange(option.slug)}
                      className={clsx(
                        "focus-ring flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-left text-[15px]",
                        selected ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-grey-50",
                      )}
                    >
                      {option.name}
                      {selected && <Check aria-hidden className="size-4" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </PopoverContent>
        </Popover>
      </div>

      <div role="group" aria-label={EXPLORE_LIST.levelsLabel} className="mt-8 flex flex-wrap justify-center gap-2">
        {chips.map((chip) => {
          const active = chip.id === level;
          return (
            <button
              key={chip.label}
              type="button"
              aria-pressed={active}
              onClick={() => onLevelChange(chip.id)}
              className={clsx(
                chipBase,
                active ? "border-black bg-ink text-white" : "border-grey-150 bg-grey-50 text-grey-600 hover:bg-grey-100",
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
