import { filterPillClass } from "../catalog.styles";
import type { CatalogueTab } from "../catalog.utils";

interface CatalogueTabsProps<T extends string> {
  tabs: CatalogueTab<T>[];
  value: T;
  onChange: (id: T) => void;
}

/** View pills above the catalogue grid (Recommended / level / All). */
export function CatalogueTabs<T extends string>({
  tabs,
  value,
  onChange,
}: CatalogueTabsProps<T>) {
  return (
    <div
      role="group"
      aria-label="Show careers"
      className="flex flex-wrap items-center gap-2"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          aria-pressed={tab.id === value}
          className={filterPillClass(tab.id === value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
