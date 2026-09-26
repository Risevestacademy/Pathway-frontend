import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  isPrimary?: boolean;
  size?: "default" | "lg";
};

export function Button({
  children,
  isPrimary = true,
  size = "default",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const variantClasses = isPrimary
  ? `bg-brand-600 text-white hover:bg-[color-mix(in_oklab,var(--color-brand-600),var(--color-brand-700)_25%)] inset-shadow-primary-btn active:inset-shadow-primary-btn-pressed`
  : `border-[0.5px] border-grey-200 bg-grey-50 text-grey-500 hover:text-ink hover:bg-[color-mix(in_oklab,var(--color-grey-50),var(--color-grey-100)_50%)] inset-shadow-secondary-btn active:inset-shadow-secondary-btn-pressed`;
  const sizeClasses = size === "lg" ? "px-6 py-3 text-base" : "px-4 py-2 text-sm";

  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center
        rounded-md font-sans font-semibold
        cursor-pointer
        transition-[box-shadow,transform,background-color,color] duration-100
        motion-reduce:transition-none
        active:translate-y-[2px]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-600
        ${sizeClasses}
        ${variantClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}