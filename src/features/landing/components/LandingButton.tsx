import { Link } from "@tanstack/react-router";
import type { LinkComponentProps } from "@tanstack/react-router";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
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

export function LandingAnchorButton({
  children,
  variant = "primary",
  size = "lg",
  className,
  ...props
}: Shared & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={landingButtonStyles({ variant, size, className })} {...props}>
      {children}
    </a>
  );
}
