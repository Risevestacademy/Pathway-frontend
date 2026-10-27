import clsx from "clsx";
import type { ReactNode } from "react";
import LandingFooter from "./LandingFooter";
import LandingNav from "./LandingNav";

/**
 * Chrome shared by the public pages (landing, explore, career detail): the
 * floating nav, the footer and the landing type system. `bandClassName` paints
 * a lavender band behind the top of the page (behind the nav), sized per page.
 */
export default function PublicPageLayout({
  children,
  bandClassName,
}: {
  children: ReactNode;
  bandClassName?: string;
}) {
  return (
    // flow-root stops the nav's top margin collapsing through this wrapper, which would push the
    // white page down and expose the grey body above the nav.
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
