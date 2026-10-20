import clsx from "clsx";

const tabBase = "rounded-lg border px-3 py-2 text-base leading-5 font-medium";

export function SkillCheckTabs() {
  return (
    <nav aria-label="My Pathway sections">
      <ul className="flex flex-wrap gap-2">
        <li>
          <span aria-disabled="true" className={clsx(tabBase, "block border-grey-50 text-grey-300")}>
            Roadmap
            <span className="sr-only"> (coming soon)</span>
          </span>
        </li>
        <li>
          <span
            aria-current="page"
            className={clsx(tabBase, "block border-transparent bg-brand-100 text-brand-700")}
          >
            Skill Check
          </span>
        </li>
        <li>
          <span aria-disabled="true" className={clsx(tabBase, "block border-grey-50 text-grey-300")}>
            Resources
            <span className="sr-only"> (coming soon)</span>
          </span>
        </li>
      </ul>
    </nav>
  );
}
