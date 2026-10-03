import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import deskSupplies from "../assets/images/desk-supplies.png";

const logo = "/brand-logo-lavender.svg";

/** The desk illustration only appears once the user is past onboarding. */
const PLAIN_SIDEBAR_ROUTES = ["/careers/onboarding", "/login"];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showIllustration = !PLAIN_SIDEBAR_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  return (
    <div className="flex min-h-svh flex-col bg-brand-50">
      <aside
        className="
          flex h-14 shrink-0 items-center px-page-mobile sm:px-page-tablet
          lg:fixed lg:inset-y-0 lg:left-0 lg:h-auto lg:w-sidebar
          lg:flex-col lg:items-start lg:justify-between lg:px-6 lg:pt-10 lg:pb-8
        "
      >
        {showIllustration && (
          <img
            src={deskSupplies}
            alt=""
            aria-hidden
            draggable={false}
            className="
              pointer-events-none fixed bottom-0 left-0 hidden h-[min(819px,85svh)] w-auto select-none
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
          <img className="h-6.5 w-auto" src={logo} alt="Pathway" />
        </Link>

        <p className="relative hidden text-sm text-grey-600 lg:block">
          ©{new Date().getFullYear()} Pathway
        </p>
      </aside>

      <div
        className="
          relative z-10 flex flex-1 flex-col overflow-clip
          rounded-t-2xl bg-surface
          lg:mt-shell-inset lg:mr-shell-inset lg:ml-sidebar lg:rounded-tr-md
        "
      >
        {children}
      </div>
    </div>
  );
}
