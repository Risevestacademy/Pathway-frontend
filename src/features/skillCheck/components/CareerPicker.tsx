import { Search2Regular } from "@mingcute/react/core-regular";
import { useId, useState } from "react";
import { SkillButton } from "./SkillButton";
import type { SkillCheckCareerSummary } from "../skillCheck.types";
import { CareerRadioList } from "./CareerRadioList";

export function CareerPicker({
  careers,
  value,
  onChange,
  name,
  groupHeadings = false,
}: {
  careers: SkillCheckCareerSummary[];
  value: string | null;
  onChange: (careerId: string) => void;
  name: string;
  groupHeadings?: boolean;
}) {
  const [query, setQuery] = useState("");
  const searchId = useId();
  const needle = query.trim().toLowerCase();
  const matches = careers.filter((career) =>
    career.name.toLowerCase().includes(needle),
  );
  const yours = matches.filter((career) => career.isActive);
  const others = matches.filter((career) => !career.isActive);

  return (
    <div className="flex flex-col gap-4">
      <div className="field-control flex items-center gap-2">
        <Search2Regular aria-hidden color="var(--color-grey-500)" className="size-5 shrink-0" />
        <label htmlFor={searchId} className="sr-only">
          Search careers
        </label>
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search careers"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-base leading-5 text-ink outline-none placeholder:text-grey-500"
        />
      </div>

      {matches.length === 0 ? (
        <div role="status" className="flex flex-col items-start gap-3 py-2">
          <p className="text-base leading-5 text-grey-600">
            No careers match &ldquo;{query.trim()}&rdquo;.
          </p>
          <SkillButton isPrimary={false} onClick={() => setQuery("")}>
            Clear search
          </SkillButton>
        </div>
      ) : groupHeadings ? (
        <>
          {yours.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm leading-5 text-grey-600">Your pathways</p>
              <CareerRadioList
                careers={yours}
                value={value}
                onChange={onChange}
                name={name}
                legend="Your pathways"
              />
            </div>
          )}
          {others.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm leading-5 text-grey-600">
                {yours.length > 0 ? "Other careers, not enrolled" : "Careers"}
              </p>
              <CareerRadioList
                careers={others}
                value={value}
                onChange={onChange}
                name={name}
                legend="Other careers"
              />
            </div>
          )}
        </>
      ) : (
        <CareerRadioList
          careers={matches}
          value={value}
          onChange={onChange}
          name={name}
          legend="Careers"
        />
      )}
    </div>
  );
}
