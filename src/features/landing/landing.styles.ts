import clsx from "clsx";

/** Content column: 1064px at the 1440 design width, scaling with the window above it (see --landing-w). */
export const container = "landing-container";

export const eyebrow = "font-accent text-lg font-medium text-grey-500";

export const sectionHeading = clsx(
  "font-landing-display font-bold tracking-[-0.02em] text-ink",
  "text-[2rem] leading-[1.1] sm:text-[2.5rem] lg:text-[2.75rem]",
);

export const sectionSubtitle = "font-landing-body text-lg leading-7 text-ink-subtle";

export const srOnly = "sr-only";
