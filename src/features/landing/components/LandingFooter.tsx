import clsx from "clsx";
import { Link } from "@tanstack/react-router";
import { InstagramRegular, LinkedinRegular, SocialXRegular } from "@mingcute/react/core-regular";
import type { ComponentType, SVGProps } from "react";
import { FOOTER } from "../landing.copy";
import logoWhite from "@/assets/landing/logo-white.svg";
import decorBook from "@/assets/landing/decor-book.webp";
import decorPencils from "@/assets/landing/decor-pencils.webp";

const SOCIAL_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  instagram: InstagramRegular,
  x: SocialXRegular,
  linkedin: LinkedinRegular,
};

const linkClass =
  "focus-ring rounded font-landing-body text-base text-white/90 transition-colors duration-150 hover:text-white motion-reduce:transition-none";

/** 31px cells drawn with two repeating gradients, white at 25%. */
const gridBackground = {
  backgroundImage:
    "linear-gradient(to right, rgb(255 255 255 / 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.25) 1px, transparent 1px)",
  backgroundSize: "31px 31px",
} as const;

export default function LandingFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-landing-footer pt-[90px] pb-16 text-white">
      {/* Decor: red book top-left straddling the edge, pencils + pink paper on the right. */}
      <img
        src={decorBook}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute -top-14 -left-5 hidden w-[141px] max-w-none select-none lg:block"
      />
      <img
        src={decorPencils}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute top-10 -right-2 hidden w-[144px] max-w-none select-none lg:block"
      />

      <div className="mx-auto w-full max-w-[1064px] px-page-mobile sm:px-page-tablet lg:px-0">
        <div
          style={gridBackground}
          className={clsx(
            "relative border border-white/25 px-6 py-10 lg:h-[155px] lg:px-16 lg:py-0",
            "flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between",
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

        <p className="mt-9 text-center font-accent text-lg text-[#cfe9d8]">{FOOTER.signoff}</p>
      </div>
    </footer>
  );
}
