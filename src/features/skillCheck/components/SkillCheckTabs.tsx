import { Link, useRouterState } from "@tanstack/react-router";
import clsx from "clsx";
import { useActiveCareerId } from "../hooks/useSkillCheck";

const tabBase = "block rounded-lg px-3 py-2 text-base leading-5 font-medium";
const disabledTab = clsx(
  tabBase,
  "cursor-not-allowed border border-grey-50 bg-surface text-grey-500",
);

export function SkillCheckTabs() {
  const activeCareerId = useActiveCareerId().data;
  const onRoadmap = useRouterState({ select: (state) => state.location.pathname.endsWith("/roadmap") });
  return (
    <nav aria-label="My Pathway sections" className="mb-4">
      <ul className="flex flex-wrap gap-2">
        <li>
          {onRoadmap ? (
            <span aria-current="page" className={clsx(tabBase, "bg-brand-100 text-brand-700")}>
              Roadmap
            </span>
          ) : activeCareerId ? (
            <Link
              to="/skill-check/$careerId/roadmap"
              params={{ careerId: activeCareerId }}
              className={clsx(
                tabBase,
                "focus-ring border border-grey-50 bg-surface text-grey-600 transition-colors duration-200 ease-out hover:bg-grey-50 motion-reduce:transition-none",
              )}
            >
              Roadmap
            </Link>
          ) : (
            <span aria-disabled="true" title="Coming soon" className={disabledTab}>
              Roadmap
              <span className="sr-only"> (coming soon)</span>
            </span>
          )}
        </li>
        <li>
          {onRoadmap ? (
            <Link
              to="/skill-check"
              className={clsx(
                tabBase,
                "focus-ring border border-grey-50 bg-surface text-grey-600 transition-colors duration-200 ease-out hover:bg-grey-50 motion-reduce:transition-none",
              )}
            >
              Skill Check
            </Link>
          ) : (
            <span aria-current="page" className={clsx(tabBase, "bg-brand-100 text-brand-700")}>
              Skill Check
            </span>
          )}
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
