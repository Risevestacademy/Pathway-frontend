import clsx from "clsx";

export interface ResourceStepNavItem {
  stepId: string;
  /** The step's place in the pathway, starting at 1. */
  number: number;
  title: string;
  /** How many of the step's resources are ticked, out of how many it has. */
  ticked: number;
  total: number;
}

/** The pathway's steps, each with how many of its resources are ticked. Picks the step shown. */
export function ResourceStepNav({
  items,
  selectedStepId,
  onSelect,
}: {
  items: ResourceStepNavItem[];
  selectedStepId: string;
  onSelect: (stepId: string) => void;
}) {
  return (
    <nav aria-label="Steps" className="rounded-3xl border border-line bg-surface p-2">
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const selected = item.stepId === selectedStepId;
          return (
            <li key={item.stepId}>
              <button
                type="button"
                onClick={() => onSelect(item.stepId)}
                aria-current={selected ? "true" : undefined}
                className={clsx(
                  "focus-ring flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-base",
                  "transition-colors duration-200 ease-out motion-reduce:transition-none",
                  selected ? "bg-brand-100 text-brand-700" : "text-ink hover:bg-surface-muted",
                )}
              >
                <span className="min-w-0">
                  Step {item.number} · {item.title}
                </span>
                <span className={clsx("shrink-0 text-sm", selected ? "text-brand-700" : "text-ink-muted")}>
                  {item.total === 0 ? "No resources" : `${item.ticked} of ${item.total}`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
