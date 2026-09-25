import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  isPrimary?: boolean;
};

export function Button({
  children,
  isPrimary = true,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const variantClasses = isPrimary
    ? `bg-brand-600 text-white inset-shadow-primary-btn active:inset-shadow-primary-btn-pressed`
    : `border-[0.5px] border-grey-200 bg-grey-50 text-grey-500 inset-shadow-secondary-btn active:inset-shadow-secondary-btn-pressed`;

  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center
        rounded px-4 py-2
        font-sans text-sm font-semibold
        transition-[box-shadow,transform] duration-100
        motion-reduce:transition-none
        active:translate-y-0.5
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:pointer-events-none
        ${variantClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}