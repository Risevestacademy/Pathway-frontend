import clsx from "clsx";

const tabBase = "block rounded-lg px-3 py-2 text-base leading-5 font-medium";
const disabledTab = clsx(
  tabBase,
  "cursor-not-allowed border border-grey-50 bg-surface text-grey-500",
);

export function SkillCheckTabs() {
  return (
    <nav aria-label="My Pathway sections" className="mb-4">
      <ul className="flex flex-wrap gap-2">
        <li>
          <span aria-disabled="true" title="Coming soon" className={disabledTab}>
            Roadmap
            <span className="sr-only"> (coming soon)</span>
          </span>
        </li>
        <li>
          <span aria-current="page" className={clsx(tabBase, "bg-brand-100 text-brand-700")}>
            Skill Check
          </span>
        </li>
        <li>
          <span aria-disabled="true" title="Coming soon" className={disabledTab}>
            Resources
            <span className="sr-only"> (coming soon)</span>
          </span>
        </li>
      </ul>
    </nav>
  );
}
