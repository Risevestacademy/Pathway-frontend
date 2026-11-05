import { Link, useRouterState } from "@tanstack/react-router";
import clsx from "clsx";

const SKILL_CHECK_PATH = "/my-pathway/skill-check";

const tabBase = "block rounded-lg px-3 py-2 text-base leading-5 font-medium";
const currentTab = clsx(tabBase, "bg-brand-100 text-brand-700");
const otherTab = clsx(
  tabBase,
  "focus-ring border border-grey-50 bg-surface text-grey-600 transition-colors duration-200 ease-out hover:bg-grey-50 motion-reduce:transition-none",
);

/** The sections of My Pathway. Roadmap is the default, until Skill Check is opened. */
export function MyPathwayTabs() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const onSkillCheck = pathname === SKILL_CHECK_PATH || pathname.startsWith(`${SKILL_CHECK_PATH}/`);

  return (
    <nav aria-label="My Pathway sections" className="mb-4">
      <ul className="flex flex-wrap gap-2">
        <li>
          {onSkillCheck ? (
            <Link to="/my-pathway" className={otherTab}>
              Roadmap
            </Link>
          ) : (
            <span aria-current="page" className={currentTab}>
              Roadmap
            </span>
          )}
        </li>
        <li>
          {onSkillCheck ? (
            <span aria-current="page" className={currentTab}>
              Skill Check
            </span>
          ) : (
            <Link to="/my-pathway/skill-check" className={otherTab}>
              Skill Check
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
