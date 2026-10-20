import clsx from "clsx";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BriefcaseRegular,
  CompassRegular,
  Dashboard2Regular,
  Directions2Regular,
  FlameRegular,
  TelescopeRegular,
} from "@mingcute/react/core-regular";
import type { ComponentType, SVGProps } from "react";
import { useAuthStore } from "../lib/stores/authStore";
import { MOCK_USER_STATS } from "./appTopNav.mock";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

interface NavItem {
  label: string;
  icon: IconComponent;
  to: "/careers" | "/skill-check" | null;
  match: string | null;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: Dashboard2Regular, to: null, match: null },
  { label: "Explore", icon: TelescopeRegular, to: "/careers", match: "/careers" },
  {
    label: "My Pathway",
    icon: Directions2Regular,
    to: "/skill-check",
    match: "/skill-check",
  },
  { label: "Opportunities", icon: BriefcaseRegular, to: null, match: null },
];

const itemBase =
  "flex items-center whitespace-nowrap gap-1.5 rounded-lg py-2 pr-3 pl-2 text-base leading-5 font-medium";

export default function AppTopNav() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const email = useAuthStore((state) => state.user?.email);
  const initial = email?.trim().charAt(0).toUpperCase() ?? "";

  return (
    <header className="flex items-center justify-between gap-3 border-b border-grey-50 px-page-mobile py-4 sm:px-page-tablet lg:px-8 lg:py-8">
      <nav aria-label="Main">
        <ul className="flex items-center gap-1 rounded-[10px] bg-grey-50 p-1">
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.match !== null && pathname.startsWith(item.match);
            const label = (
              <>
                <Icon aria-hidden className="size-6 shrink-0" />
                <span className={clsx(!isActive && "sr-only sm:not-sr-only")}>
                  {item.label}
                </span>
              </>
            );

            return (
              <li key={item.label} className="flex items-center gap-1">
                {index > 0 && (
                  <span aria-hidden className="hidden h-7 w-px bg-grey-100 sm:block" />
                )}
                {item.to ? (
                  <Link
                    to={item.to}
                    aria-current={isActive ? "page" : undefined}
                    className={clsx(
                      itemBase,
                      "focus-ring transition-colors motion-reduce:transition-none",
                      isActive
                        ? "bg-grey-900 text-white"
                        : "text-grey-500 hover:bg-grey-100",
                    )}
                  >
                    {label}
                  </Link>
                ) : (
                  <span aria-disabled="true" className={clsx(itemBase, "text-grey-300")}>
                    {label}
                    <span className="sr-only"> (coming soon)</span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex items-center gap-3">
        <ul className="hidden items-center gap-2 rounded-[10px] border border-grey-50 p-1 whitespace-nowrap lg:flex">
          <li
            aria-label={`${MOCK_USER_STATS.xp} XP`}
            className="flex items-center gap-1.5 p-1.5 text-base leading-5 font-medium text-grey-500"
          >
            <CompassRegular aria-hidden className="size-5 text-brand-500" />
            {MOCK_USER_STATS.xp} XP
          </li>
          <li aria-hidden className="h-5 w-px bg-grey-100" />
          <li
            aria-label={`${MOCK_USER_STATS.streakDays} day streak`}
            className="flex items-center gap-1.5 p-1.5 text-base leading-5 font-medium text-grey-500"
          >
            <FlameRegular aria-hidden className="size-5 text-accent-500" />
            {MOCK_USER_STATS.streakDays}
          </li>
        </ul>
        <div
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-500 text-base font-semibold text-grey-900"
        >
          {initial}
        </div>
      </div>
    </header>
  );
}
