import type { ReactNode } from "react";
import clsx from "clsx";
import { Link, useRouterState } from "@tanstack/react-router";
import deskSupplies from "../assets/images/desk-supplies.png";

const logo = "/brand-logo-lavender.svg";
const logoMark = "/favicon.svg";

const PLAIN_SIDEBAR_ROUTES = [
  "/careers/onboarding",
  "/admin",
  "/login",
  "/signup",
  "/reset-password",
  "/reset-password/reset",
];

/**
 * auto → a slim rail with only the P logo mark, at every width. No wordmark,
 *        copyright or illustration. This is what most screens use.
 * wide → the full sidebar: logo, copyright and desk illustration. Only the
 *        create account, log in and verify email screens use it.
 * none → no shell; the route renders its own chrome.
 */
export type AppShellVariant = "auto" | "wide" | "none";

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    /** Create account, log in and verify email set "wide" to keep the full sidebar. */
    shellVariant?: AppShellVariant;
  }
}

interface AppShellProps {
  children: ReactNode;
  variant?: AppShellVariant;
}

const shellStyles = {
  wide: { aside: "lg:w-sidebar lg:items-start lg:justify-between lg:px-6 lg:pt-10 lg:pb-8" },
  auto: { aside: "lg:w-sidebar-slim lg:items-center lg:px-0 lg:pt-10" },
} satisfies Record<Exclude<AppShellVariant, "none">, { aside: string }>;

/** In the full ("wide") sidebar the illustration and copyright show from `lg`. */
const FULL_SIDEBAR_ONLY = "hidden lg:block";

export default function AppShell({ children, variant = "auto" }: AppShellProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showIllustration = !PLAIN_SIDEBAR_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (variant === "none") {
    return <>{children}</>;
  }

  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  const styles = shellStyles[variant];
  // Only create account, log in and verify email keep the full sidebar.
  const fullSidebar = variant === "wide";

  return (
    <div
      className={
        isAuthRoute
          ? "h-svh overflow-hidden bg-grey-50 flex justify-center"
          : "min-h-svh bg-grey-50 flex justify-center"
      }
    >
      <div
        className={
          isAuthRoute
            ? "flex h-full w-full max-w-[2560px] flex-col overflow-hidden bg-brand-50 shadow-2xl border-x border-grey-100 lg:flex-row"
            : "flex w-full max-w-[2560px] flex-col bg-brand-50 shadow-2xl border-x border-grey-100 lg:flex-row"
        }
      >
        <aside
          className={clsx(
            "flex h-14 shrink-0 items-center px-page-mobile sm:px-page-tablet",
            "lg:sticky lg:top-0 lg:h-svh lg:flex-col",
            styles.aside,
          )}
        >
          {fullSidebar && showIllustration && (
            <img
              src={deskSupplies}
              alt=""
              aria-hidden
              draggable={false}
              // max-w-none: the base `img { max-width: 100% }` would otherwise
              // squeeze it to the sidebar's width while its height stays fixed.
              className={clsx(
                "pointer-events-none absolute bottom-0 left-0 h-[min(819px,85svh)] w-auto max-w-none select-none",
                "animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out motion-reduce:animate-none",
                FULL_SIDEBAR_ONLY,
              )}
            />
          )}

          <Link
            to="/"
            aria-label="Pathway home"
            className="relative inline-flex rounded cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-50"
          >
            {fullSidebar ? (
              <img className="h-6.5 w-auto" src={logo} alt="Pathway" />
            ) : (
              <img className="size-6" src={logoMark} alt="Pathway" />
            )}
          </Link>

          {fullSidebar && (
            <p className={clsx("relative text-sm text-grey-600", FULL_SIDEBAR_ONLY)}>
              ©{new Date().getFullYear()} Pathway
            </p>
          )}
        </aside>

        <div
          className={
            isAuthRoute
              ? "relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-hidden rounded-t-2xl bg-surface lg:mt-shell-inset lg:mr-shell-inset lg:h-[calc(100%-var(--spacing-shell-inset))] lg:rounded-tr-md border border-grey-50 shadow-panel"
              : "relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-clip rounded-t-2xl bg-surface lg:mt-shell-inset lg:mr-shell-inset lg:rounded-tr-md border border-grey-50 shadow-panel"
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
