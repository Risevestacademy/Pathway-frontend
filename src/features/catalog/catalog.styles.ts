import clsx from "clsx";

/**
 * Pill used by the catalogue tabs and filter dropdowns. Active matches the
 * primary button (brand-600, 5.35:1 with white); inactive text is grey-600
 * (5.79:1 on grey-50). brand-500 / ink-muted fall below WCAG AA 4.5:1.
 */
export function filterPillClass(isActive: boolean) {
  return clsx(
    "cursor-pointer rounded-lg border-b-4 px-4 py-1 text-body-md",
    "transition-colors duration-150 motion-reduce:transition-none",
    "focus-ring focus-visible:ring-offset-2",
    isActive
      ? "border-brand-700 bg-brand-600 text-white"
      : "border-grey-100 bg-grey-50 text-grey-600 hover:text-ink",
  );
}
