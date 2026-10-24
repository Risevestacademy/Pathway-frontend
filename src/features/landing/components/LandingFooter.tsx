import clsx from "clsx";
import { Link } from "@tanstack/react-router";
import { InstagramRegular, LinkedinRegular, SocialXRegular } from "@mingcute/react/core-regular";
import { FOOTER } from "../landing.copy";
import logoWhite from "@/assets/landing/logo-white.svg";
import decorBook from "@/assets/landing/decor-book.webp";
import decorPencils from "@/assets/landing/decor-pencils.webp";

const SOCIAL_ICONS: Record<string, typeof InstagramRegular> = {
  instagram: InstagramRegular,
  x: SocialXRegular,
  linkedin: LinkedinRegular,
};

const linkClass =
  "focus-ring rounded font-landing-body text-base text-white/90 transition-colors duration-150 hover:text-white motion-reduce:transition-none";

/** 1px grid lines, white at 25%. Cell size is set per breakpoint via background-size classes. */
const gridBackground = {
  backgroundImage:
    "linear-gradient(to right, rgb(255 255 255 / 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.25) 1px, transparent 1px)",
} as const;

export default function LandingFooter() {
  return (
    <footer className="relative mt-24 bg-landing-footer py-[90px] text-white">
      {/* Decor: red book top-left straddling the edge, pencils + pink paper on the right. The wrapper
          starts 200px above the footer and ends at its bottom, so the book can overlap the white area
          above while anything past the sides or bottom is clipped (and never extends the page). */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-[200px] bottom-0 hidden overflow-hidden lg:block">
        <img
          src={decorBook}
          alt=""
          draggable={false}
          className="absolute top-[144px] -left-5 w-[141px] max-w-none select-none"
        />
        <img
          src={decorPencils}
          alt=""
          draggable={false}
          className="absolute top-[240px] -right-2 w-[144px] max-w-none select-none"
        />
      </div>

      <div className="landing-container">
        {/* Grid frame (34 x 5 cells on desktop) with a solid block on top of it: the block is
            inset 2 columns left/right and 1 row top/bottom, so its border sits on grid lines. */}
        <div
          style={gridBackground}
          className={clsx(
            "relative border border-white/25 p-[31px] [background-size:31px_31px]",
            "lg:h-[155px] lg:p-0 lg:[background-size:calc(100%/34)_calc(100%/5)]",
          )}
        >
          <div
            className={clsx(
              "relative border border-white/25 bg-landing-footer px-6 py-8",
              "flex flex-col items-center gap-8",
              "lg:absolute lg:inset-x-[calc(200%/34)] lg:inset-y-[20%] lg:flex-row lg:justify-between lg:py-0",
            )}
          >
            <Link to="/" aria-label="Pathway home" className="focus-ring rounded">
              <img src={logoWhite} alt="" className="h-[26px] w-auto" draggable={false} />
            </Link>

            <nav aria-label="Footer">
              <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
                {FOOTER.links.map((link) => (
                  <li key={link.label}>
                    {"to" in link ? (
                      <Link to={link.to} className={linkClass}>
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className={linkClass}>
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <ul className="flex items-center gap-3">
              {FOOTER.socials.map((social) => {
                const Icon = SOCIAL_ICONS[social.id];
                return (
                  <li key={social.id}>
                    <a
                      href={social.href}
                      aria-label={social.label}
                      className={clsx(
                        "focus-ring grid size-9 place-items-center rounded-[10px] border-b-[3px] border-grey-200 bg-white text-grey-500",
                        "transition-[transform,color] duration-150 hover:text-ink active:translate-y-px active:border-b-2 motion-reduce:transition-none",
                      )}
                    >
                      <Icon aria-hidden size={18} />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
