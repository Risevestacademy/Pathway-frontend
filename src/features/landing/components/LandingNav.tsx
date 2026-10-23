import clsx from "clsx";
import { Link } from "@tanstack/react-router";
import { ArrowRightRegular } from "@mingcute/react/core-regular";
import { NAV_CTA, NAV_LINKS } from "../landing.copy";
import { LandingLinkButton } from "./LandingButton";

const logo = "/brand-logo-lavender.svg";

const linkBase = "font-landing-body text-base font-medium leading-none transition-colors duration-150 motion-reduce:transition-none";

/**
 * Floating, sticky nav. Translucent with a backdrop blur so content scrolling
 * under it blurs, as in the demo (0:07.5 and 0:16.0 in the recording).
 */
export default function LandingNav() {
  return (
    <header className="sticky top-6 z-40 mt-6 px-page-mobile sm:px-page-tablet lg:top-10 lg:mt-10 lg:px-0">
      <div
        className={clsx(
          "mx-auto flex h-14 w-full max-w-[1064px] items-center justify-between gap-4",
          "rounded-xl border border-[#e7e8e9] bg-white/85 pr-2 pl-5 shadow-[0_8px_24px_rgb(16_16_29/0.06)]",
          "backdrop-blur-md supports-[backdrop-filter]:bg-white/80",
        )}
      >
        <Link to="/" aria-label="Pathway home" className="focus-ring inline-flex shrink-0 rounded">
          <img src={logo} alt="" className="h-[22px] w-auto" draggable={false} />
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                {"comingSoon" in link && link.comingSoon ? (
                  <span
                    aria-disabled="true"
                    title="Coming soon"
                    className={clsx(linkBase, "cursor-not-allowed text-grey-500")}
                  >
                    {link.label}
                    <span className="sr-only"> (coming soon)</span>
                  </span>
                ) : "to" in link ? (
                  <Link
                    to={link.to}
                    className={clsx(linkBase, "focus-ring rounded text-ink hover:text-brand-600")}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className={clsx(linkBase, "focus-ring rounded text-grey-500 hover:text-ink")}
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            search={{ redirect: "/careers" }}
            className={clsx(linkBase, "focus-ring hidden rounded text-ink hover:text-brand-600 sm:inline")}
          >
            {NAV_CTA.login}
          </Link>
          <LandingLinkButton to="/careers/onboarding" size="md">
            {NAV_CTA.getStarted}
            <ArrowRightRegular aria-hidden size={16} />
          </LandingLinkButton>
        </div>
      </div>
    </header>
  );
}
