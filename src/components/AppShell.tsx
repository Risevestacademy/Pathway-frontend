import type { ReactNode } from "react";
import clsx from "clsx";
import { Link, useRouterState } from "@tanstack/react-router";
import deskSupplies from "../assets/images/desk-supplies.png";

const logo = "/brand-logo-lavender.svg";
const logoMark = "/favicon.svg";

const PLAIN_SIDEBAR_ROUTES = ["/careers/onboarding", "/login"];

/**
 * slim → logo mark only (hifi Discover); the default across the app.
 * wide → full logo, copyright and desk illustration (hifi Dashboard); kept for later use.
 */
export type AppShellVariant = "slim" | "wide";

interface AppShellProps {
  children: ReactNode;
  variant?: AppShellVariant;
}

export default function AppShell({ children, variant = "slim" }: AppShellProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isWide = variant === "wide";
  const showIllustration =
    isWide && !PLAIN_SIDEBAR_ROUTES.some((route) => pathname.startsWith(route));

  return (
    <div className="min-h-svh bg-grey-50 flex justify-center">
      <div className="flex w-full max-w-[2560px] flex-col bg-brand-50 shadow-2xl border-x border-grey-100 lg:flex-row">
        <aside
          className={clsx(
            "flex h-14 shrink-0 items-center px-page-mobile sm:px-page-tablet",
            "lg:sticky lg:top-0 lg:h-svh lg:flex-col",
            isWide
              ? "lg:w-sidebar lg:items-start lg:justify-between lg:px-6 lg:pt-10 lg:pb-8"
              : "lg:w-sidebar-slim lg:items-center lg:px-0 lg:pt-10",
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
              className="
                pointer-events-none absolute bottom-0 left-0 hidden h-[min(819px,85svh)] w-auto max-w-none select-none
                lg:block
                animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out
                motion-reduce:animate-none
              "
            />
          )}

          <Link
            to="/"
            aria-label="Pathway home"
            className="relative inline-flex rounded cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-50"
          >
            <img
              className={clsx("h-6.5 w-auto", !isWide && "lg:hidden")}
              src={logo}
              alt="Pathway"
            />
            {!isWide && (
              <img
                className="hidden size-6 lg:block"
                src={logoMark}
                alt="Pathway"
              />
            )}
          </Link>

          {isWide && (
            <p className="relative hidden text-sm text-grey-600 lg:block">
              ©{new Date().getFullYear()} Pathway
            </p>
          )}
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
