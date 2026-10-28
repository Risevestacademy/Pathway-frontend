import clsx from "clsx";

// Separate from components/ui/Button because the landing pages use their own type and shapes.
export type LandingButtonVariant = "primary" | "secondary";
export type LandingButtonSize = "md" | "lg";

interface StyleOptions {
  variant: LandingButtonVariant;
  size: LandingButtonSize;
  disabled?: boolean;
  className?: string;
}

export function landingButtonStyles({ variant, size, disabled = false, className }: StyleOptions) {
  return clsx(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-landing-body font-medium leading-none",
    "border-b-4 transition-[transform,background-color,border-color] duration-150",
    "focus-ring focus-visible:ring-offset-2 motion-reduce:transition-none",
    disabled
      ? "cursor-not-allowed opacity-60"
      : "cursor-pointer not-disabled:active:translate-y-[2px] not-disabled:active:border-b-2",
    size === "lg"
      ? "h-[50px] rounded-[14px] px-5 text-base"
      : "h-10 rounded-[12px] px-4 text-sm",
    variant === "primary"
      ? clsx("border-brand-600 bg-brand-500 text-white", !disabled && "hover:bg-brand-400")
      : clsx("border-grey-150 bg-white text-grey-500 ring-1 ring-grey-100 ring-inset", !disabled && "hover:bg-grey-50"),
    className,
  );
}
