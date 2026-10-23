import clsx from "clsx";

/**
 * Buttons as drawn on the landing page export: brand-500 fill with a
 * brand-600 3D edge for primary, white with a grey edge for secondary.
 * Kept separate from `components/ui/Button` because the landing page uses
 * its own type and shape system.
 */
export type LandingButtonVariant = "primary" | "secondary";
export type LandingButtonSize = "md" | "lg";

interface StyleOptions {
  variant: LandingButtonVariant;
  size: LandingButtonSize;
  className?: string;
}

export function landingButtonStyles({ variant, size, className }: StyleOptions) {
  return clsx(
    "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap",
    "font-landing-body font-medium leading-none",
    "border-b-4 transition-[transform,background-color,border-color] duration-150",
    "not-disabled:active:translate-y-[2px] not-disabled:active:border-b-2",
    "focus-ring focus-visible:ring-offset-2 motion-reduce:transition-none",
    size === "lg"
      ? "h-[50px] rounded-[14px] px-5 text-base"
      : "h-10 rounded-[12px] px-4 text-sm",
    variant === "primary"
      ? "border-brand-600 bg-brand-500 text-white hover:bg-brand-400"
      : "border-grey-150 bg-white text-grey-500 ring-1 ring-grey-100 ring-inset hover:bg-grey-50",
    className,
  );
}
