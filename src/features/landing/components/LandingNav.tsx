import clsx from "clsx";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRightRegular, CloseRegular, MenuRegular } from "@mingcute/react/core-regular";
import { NAV_CTA, NAV_LINKS, type NavLink } from "../landing.copy";
import { hashScrollOptions } from "../landing.utils";
import { LandingLinkButton } from "./LandingButton";
import logo from "@/assets/landing/logo-nav.svg";

const linkBase =
  "font-landing-body text-base font-medium leading-none transition-colors duration-150 motion-reduce:transition-none";

function NavItem({ link, onNavigate, className }: { link: NavLink; onNavigate?: () => void; className?: string }) {
  if ("comingSoon" in link) {
    return (
      <span aria-disabled="true" title="Coming soon" className={clsx(linkBase, "cursor-not-allowed text-grey-500", className)}>
        {link.label}
        <span className="sr-only"> (coming soon)</span>
      </span>
    );
  }
  if ("hash" in link) {
    return (
      <Link
        to={link.to}
        hash={link.hash}
        hashScrollIntoView={hashScrollOptions()}
        onClick={onNavigate}
        className={clsx(linkBase, "focus-ring rounded text-grey-500 hover:text-ink", className)}
      >
        {link.label}
      </Link>
    );
  }
  return (
    <Link to={link.to} onClick={onNavigate} className={clsx(linkBase, "focus-ring rounded text-ink hover:text-brand-600", className)}>
      {link.label}
    </Link>
  );
}

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // A disclosure, not a modal: rather than trapping focus, it closes once focus or a tap leaves the nav.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      menuButtonRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      className="sticky top-6 z-40 mt-6 lg:top-10 lg:mt-10"
    >
      <div
        className={clsx(
          "landing-container",
          "rounded-xl border border-[#e7e8e9] bg-white/85",
          "backdrop-blur-md supports-[backdrop-filter]:bg-white/80",
        )}
      >
        {/* Below 360px the logo, Get Started and the menu button only fit with tighter spacing and no arrow. */}
        <div className="flex h-14 items-center justify-between gap-4 pr-2 pl-5 max-[359px]:gap-2 max-[359px]:pl-4">
          <Link to="/" aria-label="Pathway home" className="focus-ring inline-flex shrink-0 rounded">
            <img src={logo} alt="" className="h-5 w-auto max-[359px]:h-[18px]" draggable={false} />
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

          <div className="flex items-center gap-3 max-[359px]:gap-1 sm:gap-4">
            <Link
              to="/login"
              search={{ redirect: "/careers" }}
              className={clsx(linkBase, "focus-ring hidden rounded text-ink hover:text-brand-600 md:inline")}
            >
              {NAV_CTA.login}
            </Link>
            <LandingLinkButton to="/careers/onboarding" size="md" className="max-[359px]:px-3">
              {NAV_CTA.getStarted}
              <ArrowRightRegular aria-hidden size={16} className="max-[359px]:hidden" />
            </LandingLinkButton>
            <button
              ref={menuButtonRef}
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
