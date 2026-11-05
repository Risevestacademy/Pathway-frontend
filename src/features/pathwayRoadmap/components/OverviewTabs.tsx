import { Link } from "@tanstack/react-router";
import clsx from "clsx";

export type PathwaySection = "overview" | "resources" | "progress";

const tab = "block px-4 pb-3 text-base";
const currentTab = clsx(tab, "-mb-px border-b-2 border-brand-600 font-medium text-brand-700");
const linkTab = clsx(
  tab,
  "focus-ring rounded-t text-ink-muted transition-colors duration-200 ease-out hover:text-ink motion-reduce:transition-none",
);
const soonTab = clsx(tab, "cursor-not-allowed text-ink-muted");

/** The sections of one career's pathway. Practice tasks has no screen yet. */
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
        <li>
          <span aria-disabled="true" title="Coming soon" className={soonTab}>
            Practice tasks
            <span className="sr-only"> (coming soon)</span>
          </span>
        </li>
        <li>
          {current === "progress" ? (
            <span aria-current="page" className={currentTab}>
              Progress
            </span>
          ) : (
            <Link to="/my-pathway/$careerId/progress" params={{ careerId }} className={linkTab}>
              Progress
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
