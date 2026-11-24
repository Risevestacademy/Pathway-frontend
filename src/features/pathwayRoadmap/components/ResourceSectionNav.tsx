import clsx from "clsx";

export interface ResourceSectionNavItem {
  id: string;
  title: string;
  /** How many of the section's resources are ticked, out of how many it has. */
  ticked: number;
  total: number;
}

/** The pathway's stages (or its steps, when the stages aren't known), each with how many of its resources are ticked. */
export function ResourceSectionNav({
  label,
  emptyLabel = "No resources",
  items,
  selectedId,
  onSelect,
}: {
  label: string;
  /** What an entry with nothing in it says instead of "0 of 0". */
  emptyLabel?: string;
  items: ResourceSectionNavItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav aria-label={label} className="rounded-3xl border border-line bg-surface p-2">
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const selected = item.id === selectedId;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-current={selected ? "true" : undefined}
                className={clsx(
                  "focus-ring flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-base",
                  "transition-colors duration-200 ease-out motion-reduce:transition-none",
                  selected ? "bg-brand-100 text-brand-700" : "text-ink hover:bg-surface-muted",
                )}
              >
                <span className="min-w-0">{item.title}</span>
                <span className={clsx("shrink-0 text-sm", selected ? "text-brand-700" : "text-ink-muted")}>
                  {item.total === 0 ? emptyLabel : `${item.ticked} of ${item.total}`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
