import clsx from "clsx";

export function skillButtonClass(isPrimary: boolean, className = "") {
  return clsx(
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3",
    "cursor-pointer text-base leading-5 font-medium whitespace-nowrap",
    "transition-[transform,background-color,border-color,opacity] duration-200 ease-out motion-reduce:transition-none",
    "focus-ring focus-visible:ring-offset-2",
    "not-disabled:active:translate-y-px",
    "disabled:cursor-not-allowed disabled:opacity-50",
    isPrimary
      ? "border-b-4 border-brand-600 bg-brand-500 text-white not-disabled:hover:bg-brand-600"
      : "border border-b-4 border-grey-100 bg-surface text-grey-500 not-disabled:hover:bg-grey-50",
    className,
  );
}

