import clsx from "clsx";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BriefcaseRegular,
  CompassRegular,
  Directions2Regular,
  FlameRegular,
  Layout3Regular,
  TelescopeRegular,
} from "@mingcute/react/core-regular";
import type { ComponentType, SVGProps } from "react";
import { useAuthStore } from "../lib/stores/authStore";
import { MOCK_USER_STATS } from "./appTopNav.mock";
import { NavIcon } from "./NavIcon";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

interface NavItem {
  label: string;
  iconName: string;
  fallback: IconComponent;
  to: "/careers" | "/skill-check" | null;
  match: string | null;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", iconName: "dashboard", fallback: Layout3Regular, to: null, match: null },
  { label: "Explore", iconName: "explore", fallback: TelescopeRegular, to: "/careers", match: "/careers" },
  {
    label: "My Pathway",
    iconName: "my-pathway",
    fallback: Directions2Regular,
    to: "/skill-check",
    match: "/skill-check",
  },
  { label: "Opportunities", iconName: "opportunities", fallback: BriefcaseRegular, to: null, match: null },
];

const avatarFiles = import.meta.glob("/src/assets/images/avatar.svg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
const avatarUrl = Object.values(avatarFiles)[0] ?? null;

const itemBase =
  "flex h-10 items-center gap-1.5 rounded-lg py-2 pr-3 pl-2 text-base leading-5 font-medium whitespace-nowrap";

const statBase = "flex items-center gap-1.5 whitespace-nowrap p-1.5 text-base leading-5 font-medium text-grey-600";

export default function AppTopNav() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const email = useAuthStore((state) => state.user?.email);
  const initial = email?.trim().charAt(0).toUpperCase() ?? "";

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-grey-50 bg-surface px-page-mobile py-4 sm:px-page-tablet lg:px-8 lg:py-8">
      <nav aria-label="Main">
        <ul className="flex items-center gap-2 rounded-[10px] bg-grey-50 p-1">
          {NAV_ITEMS.map((item, index) => {
            const isActive = item.match !== null && pathname.startsWith(item.match);
            const label = (
              <>
                <NavIcon
                  name={item.iconName}
                  fallback={item.fallback}
                  className={isActive ? "text-white" : "text-grey-500"}
                />
                <span className={clsx(!isActive && "sr-only sm:not-sr-only")}>{item.label}</span>
              </>
            );

            return (
              <li key={item.label} className="flex items-center gap-2">
                {index > 0 && (
                  <span aria-hidden className="hidden h-7 w-px bg-grey-100 sm:block" />
                )}
                {item.to ? (
                  <Link
                    to={item.to}
                    aria-current={isActive ? "page" : undefined}
                    className={clsx(
                      itemBase,
                      "focus-ring transition-colors duration-200 ease-out motion-reduce:transition-none",
                      isActive ? "bg-grey-900 text-white" : "text-grey-600 hover:bg-grey-100",
                    )}
                  >
                    {label}
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    title="Coming soon"
                    className={clsx(itemBase, "cursor-not-allowed text-grey-600")}
                  >
                    {label}
                    <span className="sr-only"> (coming soon)</span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex items-center gap-3 lg:gap-2">
        <ul className="hidden items-center gap-2 rounded-[10px] border border-grey-50 p-1 lg:flex">
          <li aria-label={`${MOCK_USER_STATS.xp} XP`} className={statBase}>
            <CompassRegular aria-hidden className="size-5 text-brand-500" />
            {MOCK_USER_STATS.xp} XP
          </li>
          <li aria-hidden className="h-8 w-px bg-grey-100" />
          <li aria-label={`${MOCK_USER_STATS.streakDays} day streak`} className={statBase}>
            <FlameRegular aria-hidden className="size-5 text-[#ff9845]" />
            {MOCK_USER_STATS.streakDays}
          </li>
        </ul>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            aria-hidden
            className="size-10 shrink-0 rounded-full"
          />
        ) : (
          <div
            aria-hidden
            className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-500 text-base font-semibold text-grey-900"
          >
            {initial}
          </div>
        )}
      </div>
    </header>
  );
}
