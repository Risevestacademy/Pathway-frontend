import clsx from "clsx";
import type { ReactNode } from "react";
import LandingFooter from "./LandingFooter";
import LandingNav from "./LandingNav";

export default function PublicPageLayout({
  children,
  bandClassName,
}: {
  children: ReactNode;
  bandClassName?: string;
}) {
  return (
    // flow-root stops the nav's top margin collapsing through and exposing the grey body above it.
    <div className="relative flow-root min-h-svh bg-white font-landing-body text-ink antialiased">
      {bandClassName && (
        <div aria-hidden className={clsx("absolute inset-x-0 top-0 bg-brand-50", bandClassName)} />
      )}
      <LandingNav />
      <main className="relative">{children}</main>
      <LandingFooter />
    </div>
  );
}
