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
  "/reset-password",
  "/reset-password/reset",
];

/**
 * auto → logo-mark rail up to 1440px, full sidebar above (the `shell` breakpoint).
 * wide → always the full sidebar: logo, copyright and desk illustration.
 *
 * Wider-than-1440 behaviour is pending designer confirmation.
 */
export type AppShellVariant = "auto" | "wide";

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    /** Routes that always need the full sidebar (e.g. auth) set "wide". */
    shellVariant?: AppShellVariant;
  }
}

interface AppShellProps {
  children: ReactNode;
  variant?: AppShellVariant;
}

// From `lg`, the full sidebar shows always for "wide" and only above 1440px for "auto".
const shellStyles = {
  wide: {
    aside: "lg:w-sidebar lg:items-start lg:justify-between lg:px-6 lg:pt-10 lg:pb-8",
    fullOnly: "hidden lg:block",
    logo: "",
    mark: "hidden",
  },
  auto: {
    aside: clsx(
      "lg:w-sidebar-slim lg:items-center lg:px-0 lg:pt-10",
      "shell:w-sidebar shell:items-start shell:justify-between shell:px-6 shell:pb-8",
    ),
    fullOnly: "hidden shell:block",
    logo: "lg:hidden shell:block",
    mark: "hidden lg:block shell:hidden",
  },
} satisfies Record<AppShellVariant, Record<string, string>>;

export default function AppShell({ children, variant = "auto" }: AppShellProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showIllustration = !PLAIN_SIDEBAR_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const styles = shellStyles[variant];

  return (
    <div className="min-h-svh bg-grey-50 flex justify-center">
      <div className="flex w-full max-w-[2560px] flex-col bg-brand-50 shadow-2xl border-x border-grey-100 lg:flex-row">
        <aside
          className={clsx(
            "flex h-14 shrink-0 items-center px-page-mobile sm:px-page-tablet",
            "lg:sticky lg:top-0 lg:h-svh lg:flex-col",
            styles.aside,
          )}
        >
          {showIllustration && (
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
                styles.fullOnly,
              )}
            />
          )}

          <Link
            to="/"
            aria-label="Pathway home"
            className="relative inline-flex rounded cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-50"
          >
            <img
              className={clsx("h-6.5 w-auto", styles.logo)}
              src={logo}
              alt="Pathway"
            />
            <img
              className={clsx("size-6", styles.mark)}
              src={logoMark}
              alt="Pathway"
            />
          </Link>

          <p className={clsx("relative text-sm text-grey-600", styles.fullOnly)}>
            ©{new Date().getFullYear()} Pathway
          </p>
        </aside>

        <div
          className="
            relative z-10 flex flex-1 flex-col overflow-clip
            rounded-t-2xl bg-surface
            lg:mt-shell-inset lg:mr-shell-inset lg:rounded-tr-md
            border border-grey-50 shadow-panel
          "
        >
          {children}
        </div>
      </div>
    </div>
  );
}
