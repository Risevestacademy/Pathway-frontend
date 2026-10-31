import clsx from "clsx";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BriefcaseRegular,
  Directions2Regular,
  Layout3Regular,
  TelescopeRegular,
} from "@mingcute/react/core-regular";
import type { ComponentType, SVGProps } from "react";
import {
  selectIsAuthenticated,
  selectIsRestoringSession,
  useAuthStore,
} from "../lib/stores/authStore";
import { NavIcon } from "./NavIcon";
import { FeedbackButton } from "../features/feedback/components/FeedbackButton";
import { SignOutButton } from "../features/auth/components/SignOutButton";

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

export default function AppTopNav() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const email = useAuthStore((state) => state.user?.email);
  const signedIn = useAuthStore(selectIsAuthenticated);
  // Until the session is restored after a reload, don't offer "Sign in".
  const restoringSession = useAuthStore(selectIsRestoringSession);
  const visibleItems = signedIn ? NAV_ITEMS : NAV_ITEMS.filter((item) => item.to !== null);
  const initial = email?.trim().charAt(0).toUpperCase() ?? "";

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-grey-50 bg-surface px-page-mobile py-4 sm:px-page-tablet lg:px-8 lg:py-8">
      <nav aria-label="Main">
        <ul className="flex items-center gap-2 rounded-[10px] bg-grey-50 p-1">
          {visibleItems.map((item, index) => {
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
        <FeedbackButton />
        {signedIn && <SignOutButton />}
        {restoringSession ? (
          <div
            role="status"
            aria-label="Checking your sign-in"
            className="size-10 shrink-0 animate-pulse rounded-full bg-grey-50 motion-reduce:animate-none"
          />
        ) : signedIn ? (
          <>
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
          </>
        ) : (
          <Link
            to="/login"
            search={{ redirect: pathname }}
            className="focus-ring rounded-lg border border-b-4 border-grey-100 bg-surface px-4 py-2 text-base leading-5 font-medium whitespace-nowrap text-grey-600 transition-colors duration-200 ease-out hover:bg-grey-50 motion-reduce:transition-none"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
