import { Link } from "@tanstack/react-router";
import type { LinkComponentProps } from "@tanstack/react-router";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  landingButtonStyles,
  type LandingButtonSize,
  type LandingButtonVariant,
} from "../landingButton.styles";

type Shared = {
  children: ReactNode;
  variant?: LandingButtonVariant;
  size?: LandingButtonSize;
  className?: string;
};

export function LandingButton({
  children,
  variant = "primary",
  size = "lg",
  className,
  type = "button",
  ...props
}: Shared & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={landingButtonStyles({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}

export function LandingLinkButton({
  children,
  variant = "primary",
  size = "lg",
  className,
  ...props
}: Shared & LinkComponentProps<"a">) {
  return (
    <Link className={landingButtonStyles({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}

// Not a link or button, so it can't be clicked or tabbed to until the destination exists.
export function LandingComingSoonButton({ children, variant = "primary", size = "lg", className }: Shared) {
  return (
    <span aria-disabled="true" title="Coming soon" className={landingButtonStyles({ variant, size, disabled: true, className })}>
      {children}
      <span className="sr-only"> (coming soon)</span>
    </span>
  );
}
