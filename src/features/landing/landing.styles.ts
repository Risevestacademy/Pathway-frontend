import clsx from "clsx";

/** 1064px content column from the export, with the app's page gutters below it. */
export const container = "mx-auto w-full max-w-[1064px] px-page-mobile sm:px-page-tablet lg:px-0";

export const eyebrow = "font-accent text-lg font-medium text-grey-500";

export const sectionHeading = clsx(
  "font-landing-display font-bold tracking-[-0.02em] text-ink",
  "text-[2rem] leading-[1.1] sm:text-[2.5rem] lg:text-[2.75rem]",
);

export const sectionSubtitle = "font-landing-body text-lg leading-7 text-ink-subtle";

export const srOnly = "sr-only";
