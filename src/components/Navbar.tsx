import { Link } from "@tanstack/react-router";
import logo from "/brand-logo.svg";

export default function Navbar() {
  return (
    <nav
      aria-label="Main navigation"
      className="
        flex items-center justify-start
        border-b border-line bg-surface
        px-page-mobile py-4
        sm:px-page-tablet
        lg:justify-between lg:px-page-desktop
        xl:px-page-wide
      "
    >
      <Link
        to="/"
        aria-label="Pathway home"
        className="inline-flex items-center"
      >
        <img className="h-7 w-auto cursor-pointer" src={logo} alt="Pathway" />
      </Link>

      {/* Change when needed */}
      <a
        href="/careers"
        className="
          hidden
          font-sans text-sm font-medium text-ink-muted
          transition-colors hover:text-ink
          lg:block
        "
      >
        Careers
      </a>
    </nav>
  );
}
