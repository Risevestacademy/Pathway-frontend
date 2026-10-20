import clsx from "clsx";
import { getAreaProgress } from "../skillCheck.utils";
import type { AreaGroup } from "../skillCheck.utils";
import type { SkillAnswerMap } from "../skillCheck.types";

export function AreaNav({
  groups,
  answers,
  activeAreaId,
  onSelect,
}: {
  groups: AreaGroup[];
  answers: SkillAnswerMap;
  activeAreaId: string;
  onSelect: (areaId: string) => void;
}) {
  return (
    <nav
      aria-label="Skill areas"
      className="min-w-0 rounded-2xl border border-grey-100 bg-surface p-3 lg:w-72 lg:shrink-0"
    >
      <ul className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
        {groups.map(({ area, skills }) => {
          const progress = getAreaProgress(skills, answers);
          const isActive = area.id === activeAreaId;
          return (
            <li key={area.id} className="shrink-0 lg:shrink">
              <button
                type="button"
                aria-current={isActive ? "true" : undefined}
                onClick={() => onSelect(area.id)}
                className={clsx(
                  "focus-ring flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-left text-sm leading-5 transition-colors motion-reduce:transition-none",
                  isActive
                    ? "bg-brand-100 text-brand-700"
                    : "bg-grey-50 text-ink hover:bg-grey-100",
                )}
              >
                <span className="font-medium whitespace-nowrap">{area.name}</span>
                <span className={isActive ? "text-brand-700" : "text-grey-600"}>
                  {progress.answered} of {progress.total}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
