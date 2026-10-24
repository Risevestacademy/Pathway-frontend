import { Link } from "@tanstack/react-router";
import { skillButtonClass } from "../skillButton.styles";
import type { LinkComponentProps } from "@tanstack/react-router";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type SkillButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  isPrimary?: boolean;
};

export function SkillButton({
  children,
  isPrimary = true,
  className = "",
  type = "button",
  ...props
}: SkillButtonProps) {
  return (
    <button type={type} className={skillButtonClass(isPrimary, className)} {...props}>
      {children}
    </button>
  );
}

type SkillLinkProps = LinkComponentProps & {
  children: ReactNode;
  isPrimary?: boolean;
  className?: string;
};

export function SkillLink({
  children,
  isPrimary = true,
  className = "",
  ...props
}: SkillLinkProps) {
  return (
    <Link {...props} className={skillButtonClass(isPrimary, className)}>
      {children}
    </Link>
  );
}
