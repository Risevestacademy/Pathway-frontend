import type { ReactNode } from "react";
import heroCubes from "@/assets/images/discover-hero-cubes.svg";

interface PathwayHeroProps {
  headingId: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function PathwayHero({
  headingId,
  title,
  description,
  children,
}: PathwayHeroProps) {
  return (
    <section
      aria-labelledby={headingId}
      className="
        relative overflow-hidden rounded-2xl border border-line bg-surface
        p-6 sm:p-10 lg:bg-linear-to-r lg:from-surface lg:from-45% lg:to-brand-100
      "
    >
      <img
        src={heroCubes}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-auto max-w-[45%] object-cover object-left select-none lg:block"
      />

      <div className="relative lg:max-w-[55%]">
        <h1
          id={headingId}
          className="font-display text-4xl font-semibold tracking-tight text-ink lg:text-[2.5rem]"
        >
          {title}
        </h1>
        <p className="mt-4 max-w-[65ch] text-body-md text-ink">{description}</p>
        {children}
      </div>
    </section>
  );
}
