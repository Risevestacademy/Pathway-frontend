import clsx from "clsx";
import { container, eyebrow } from "@/features/landing/landing.styles";
import { landingButtonStyles } from "@/features/landing/landingButton.styles";
import { scrollToAnchor } from "@/features/landing/landing.utils";
import planIcon from "@/assets/landing/explore-pill-plan.svg";
import exploreIcon from "@/assets/landing/explore-pill-explore.svg";
import { EXPLORE_HERO, EXPLORE_LIST } from "../explore.copy";

function Pill({ icon, label, className }: { icon: string; label: string; className: string }) {
  return (
    <span aria-hidden className={clsx("pointer-events-none absolute hidden items-center lg:flex", className)}>
      <span className="grid size-[52px] place-items-center rounded-full bg-brand-200">
        <img src={icon} alt="" draggable={false} className="size-6 select-none" />
      </span>
      <span className="grid h-[52px] place-items-center rounded-full bg-brand-200 px-4 font-landing-body text-2xl font-medium text-brand-500">
        {label}
      </span>
    </span>
  );
}

/**
 * Explore hero on the lavender band. The band itself is painted by
 * PublicPageLayout (it runs behind the nav); this section's height is the
 * band height minus the nav, per breakpoint.
 */
export default function ExploreHero() {
  return (
    <section
      aria-labelledby="explore-heading"
      className="relative h-[440px] overflow-x-clip md:h-[540px] lg:h-[652px]"
    >
      {/* Decorative wave on the left edge, the CTA wave's shape in lavender. */}
      <svg
        aria-hidden
        viewBox="-40 -30 700 320"
        className="pointer-events-none absolute top-[262px] -left-10 hidden w-[700px] lg:block"
        fill="none"
      >
        <path
          d="M-40 -20 L84 196 Q114 248 144 196 L241 31 Q271 -20 301 31 L401 214 Q421 253 465 253 L613 253"
          stroke="var(--color-brand-100)"
          strokeWidth="28"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <Pill icon={planIcon} label={EXPLORE_HERO.pills.plan} className="top-[120px] left-[calc(50%-440px)]" />
      <Pill icon={exploreIcon} label={EXPLORE_HERO.pills.explore} className="top-[381px] left-[calc(50%+271px)]" />

      <div className={clsx(container, "relative pt-[90px] text-center md:pt-[130px] lg:pt-[164px]")}>
        <p className={clsx(eyebrow, "text-[22px]")}>{EXPLORE_HERO.eyebrow}</p>
        <h1
          id="explore-heading"
          className="mx-auto mt-5 font-landing-display text-[2.5rem] leading-[1.05] font-bold tracking-[-0.02em] whitespace-pre-line text-ink sm:text-[3.25rem] lg:text-[4rem]"
        >
          {EXPLORE_HERO.heading}
        </h1>
        <a
          href={`#${EXPLORE_LIST.anchor}`}
          onClick={(event) => scrollToAnchor(event, `#${EXPLORE_LIST.anchor}`)}
          className={landingButtonStyles({ variant: "secondary", size: "lg", className: "mt-11" })}
        >
          {EXPLORE_HERO.cta}
        </a>
      </div>
    </section>
  );
}
