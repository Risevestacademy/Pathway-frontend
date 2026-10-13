import clsx from "clsx";

export interface CatalogueTab<T extends string> {
  id: T;
  label: string;
}

interface CatalogueTabsProps<T extends string> {
  tabs: CatalogueTab<T>[];
  value: T;
  onChange: (id: T) => void;
}

/** Filter pills above the catalogue grid (Recommended / level / All). */
export function CatalogueTabs<T extends string>({
  tabs,
  value,
  onChange,
}: CatalogueTabsProps<T>) {
  return (
    <div
      role="group"
      aria-label="Filter careers"
      className="flex flex-wrap items-center gap-2"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-pressed={isActive}
            className={clsx(
              "cursor-pointer rounded-[16px] border-b-4 px-4 py-2 text-body-md",
              "transition-colors duration-150 motion-reduce:transition-none",
              "focus-ring focus-visible:ring-offset-2",
              isActive
                ? "border-brand-edge bg-brand-500 text-white"
                : "border-grey-100 bg-grey-50 text-ink-muted hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
