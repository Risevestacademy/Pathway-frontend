import clsx from "clsx";
import { Link } from "@tanstack/react-router";
import type { LinkComponentProps } from "@tanstack/react-router";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Size = "default" | "lg";

type StyleOptions = {
  isPrimary: boolean;
  size: Size;
  className: string;
};

function buttonStyles({ isPrimary, size, className }: StyleOptions) {
  return clsx(
    "inline-flex items-center justify-center gap-2 rounded-[16px]",
    "cursor-pointer font-sans leading-5 font-semibold",
    "transition-[transform,background-color,opacity] duration-150 motion-reduce:transition-none",
    "focus-ring focus-visible:ring-offset-2",
    "not-disabled:active:translate-y-[2px] not-disabled:active:border-b-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    size === "lg" ? "px-4 py-3 text-base" : "px-4 py-2 text-sm",
    isPrimary
      ? "border-b-4 border-brand-700 bg-brand-600 text-white not-disabled:hover:bg-[color-mix(in_oklab,var(--color-brand-600),var(--color-brand-700)_25%)]"
      : "border border-b-4 border-grey-100 bg-surface text-grey-600 not-disabled:hover:bg-grey-50",
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  isPrimary?: boolean;
  size?: Size;
};

export function Button({
  children,
  isPrimary = true,
  size = "default",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ isPrimary, size, className })}
      {...props}
    >
      {children}
    </button>
  );
}

type LinkButtonProps = LinkComponentProps<"a"> & {
  isPrimary?: boolean;
  size?: Size;
};

export function LinkButton({
  to,
  children,
  isPrimary = true,
  size = "default",
  className = "",
  ...props
}: LinkButtonProps) {
  return (
    <Link
      to={to}
      className={buttonStyles({ isPrimary, size, className })}
      {...props}
    >
      {children}
    </Link>
  );
}