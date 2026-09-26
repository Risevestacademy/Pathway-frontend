import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

const logo = "/brand-logo.svg";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:h-16 md:px-8">
        <Link
          to="/"
          aria-label="Pathway home"
          className="inline-flex items-center rounded cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <img className="h-7 w-auto" src={logo} alt="Pathway" />
        </Link>

        <Link
          to="/careers/onboarding"
          className="hidden text-sm text-ink-muted hover:text-ink transition-colors cursor-pointer md:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded px-2 py-1"
        >
          Careers
        </Link>

        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((v) => !v)}
          className="grid size-9 place-items-center rounded-md text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 md:hidden cursor-pointer"
        >
          {mobileOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>
      </div>

      {mobileOpen && (
        <div id="mobile-nav" className="border-t border-line bg-surface px-4 py-4 md:hidden">
          <Link to="/careers/onboarding" onClick={() => setMobileOpen(false)} className="block text-sm text-ink-muted hover:text-ink cursor-pointer py-1">
            Careers
          </Link>
        </div>
      )}
    </header>
  );
}