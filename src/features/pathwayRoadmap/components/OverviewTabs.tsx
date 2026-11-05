import { Link } from "@tanstack/react-router";
import clsx from "clsx";

export type PathwaySection = "overview" | "resources";

const tab = "block px-4 pb-3 text-base";
const currentTab = clsx(tab, "-mb-px border-b-2 border-brand-600 font-medium text-brand-700");
const linkTab = clsx(
  tab,
  "focus-ring rounded-t text-ink-muted transition-colors duration-200 ease-out hover:text-ink motion-reduce:transition-none",
);
const soonTab = clsx(tab, "cursor-not-allowed text-ink-muted");

/** The sections of one career's pathway. Practice tasks and Progress have no screens yet. */
export function OverviewTabs({
  careerId,
  current,
}: {
  careerId: string;
  current: PathwaySection;
}) {
  return (
    <nav aria-label="Pathway sections" className="border-b border-line">
      <ul className="flex flex-wrap gap-x-4">
        <li>
          {current === "overview" ? (
            <span aria-current="page" className={currentTab}>
              Overview
            </span>
          ) : (
            <Link to="/my-pathway/$careerId/overview" params={{ careerId }} className={linkTab}>
              Overview
            </Link>
          )}
        </li>
        <li>
          {current === "resources" ? (
            <span aria-current="page" className={currentTab}>
              Resources
            </span>
          ) : (
            <Link to="/my-pathway/$careerId/resources" params={{ careerId }} className={linkTab}>
              Resources
            </Link>
          )}
        </li>
        {["Practice tasks", "Progress"].map((label) => (
          <li key={label}>
            <span aria-disabled="true" title="Coming soon" className={soonTab}>
              {label}
              <span className="sr-only"> (coming soon)</span>
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
}
