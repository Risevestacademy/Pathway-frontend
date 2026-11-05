import clsx from "clsx";

const SECTIONS = [
  { label: "Overview", available: true },
  { label: "Resources", available: false },
  { label: "Practice tasks", available: false },
  { label: "Progress", available: false },
];

const tab = "block px-4 pb-3 text-lg";

/** The sections of a pathway overview. Only Overview has content so far. */
export function OverviewTabs() {
  return (
    <nav aria-label="Pathway sections" className="border-b border-line">
      <ul className="flex flex-wrap gap-x-4">
        {SECTIONS.map(({ label, available }) => (
          <li key={label}>
            {available ? (
              <span
                aria-current="page"
                className={clsx(tab, "-mb-px border-b-2 border-brand-600 font-medium text-brand-700")}
              >
                {label}
              </span>
            ) : (
              <span
                aria-disabled="true"
                title="Coming soon"
                className={clsx(tab, "cursor-not-allowed text-ink-muted")}
              >
                {label}
                <span className="sr-only"> (coming soon)</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
