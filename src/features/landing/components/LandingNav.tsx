import clsx from "clsx";
import { useEffect, useId, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRightRegular, CloseRegular, MenuRegular } from "@mingcute/react/core-regular";
import { NAV_CTA, NAV_LINKS, type NavLink } from "../landing.copy";
import { scrollToAnchor } from "../landing.utils";
import { LandingLinkButton } from "./LandingButton";
import logo from "@/assets/landing/logo-nav.svg";

const linkBase =
  "font-landing-body text-base font-medium leading-none transition-colors duration-150 motion-reduce:transition-none";

function NavItem({ link, onNavigate, className }: { link: NavLink; onNavigate?: () => void; className?: string }) {
  if ("comingSoon" in link && link.comingSoon) {
    return (
      <span aria-disabled="true" title="Coming soon" className={clsx(linkBase, "cursor-not-allowed text-grey-500", className)}>
        {link.label}
        <span className="sr-only"> (coming soon)</span>
      </span>
    );
  }
  if ("to" in link) {
    return (
      <Link to={link.to} onClick={onNavigate} className={clsx(linkBase, "focus-ring rounded text-ink hover:text-brand-600", className)}>
        {link.label}
      </Link>
    );
  }
  return (
    <a
      href={link.href}
      onClick={(event) => {
        scrollToAnchor(event, link.href);
        onNavigate?.();
      }}
      className={clsx(linkBase, "focus-ring rounded text-grey-500 hover:text-ink", className)}
    >
      {link.label}
    </a>
  );
}

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return (
    <header className="sticky top-6 z-40 mt-6 lg:top-10 lg:mt-10">
      <div
        className={clsx(
          "landing-container",
          "rounded-xl border border-[#e7e8e9] bg-white/85",
          "backdrop-blur-md supports-[backdrop-filter]:bg-white/80",
        )}
      >
        <div className="flex h-14 items-center justify-between gap-4 pr-2 pl-5">
          <Link to="/" aria-label="Pathway home" className="focus-ring inline-flex shrink-0 rounded">
            <img src={logo} alt="" className="h-5 w-auto" draggable={false} />
          </Link>

          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <NavItem link={link} />
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/login"
              search={{ redirect: "/careers" }}
              className={clsx(linkBase, "focus-ring hidden rounded text-ink hover:text-brand-600 md:inline")}
            >
              {NAV_CTA.login}
            </Link>
            <LandingLinkButton to="/careers/onboarding" size="md">
              {NAV_CTA.getStarted}
              <ArrowRightRegular aria-hidden size={16} />
            </LandingLinkButton>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
              className="focus-ring grid size-10 cursor-pointer place-items-center rounded-lg text-ink hover:bg-grey-50 md:hidden"
            >
              {open ? <CloseRegular aria-hidden size={22} /> : <MenuRegular aria-hidden size={22} />}
            </button>
          </div>
        </div>

        <nav
          id={menuId}
          aria-label="Main"
          hidden={!open}
          className="border-t border-grey-100 px-5 py-4 md:hidden"
        >
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <NavItem link={link} onNavigate={() => setOpen(false)} className="block py-1" />
              </li>
            ))}
            <li>
              <Link
                to="/login"
                search={{ redirect: "/careers" }}
                onClick={() => setOpen(false)}
                className={clsx(linkBase, "focus-ring block rounded py-1 text-ink hover:text-brand-600")}
              >
                {NAV_CTA.login}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
