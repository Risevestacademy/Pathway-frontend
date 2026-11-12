import clsx from "clsx";
import { Link } from "@tanstack/react-router";
import { COMPARE } from "@/features/compare/compare.copy";

export type ExploreTab = "careers" | "compare" | "saved";

const tabBase = "block rounded-lg px-3 py-2 text-base leading-5 font-medium";

export default function ExploreTabs({ current }: { current: ExploreTab }) {
  return (
    <nav aria-label={COMPARE.tabs.label} className="mb-6">
      <ul className="flex flex-wrap gap-1.5">
        <li>
          <TabLink to="/careers" active={current === "careers"}>
            {COMPARE.tabs.careers}
          </TabLink>
        </li>
        <li>
          <TabLink to="/careers/compare" active={current === "compare"}>
            {COMPARE.tabs.compare}
          </TabLink>
        </li>
        <li>
          <span
            aria-disabled="true"
            title="Coming soon"
            className={clsx(
              tabBase,
              "cursor-not-allowed border border-grey-50 bg-surface text-grey-500",
            )}
          >
            {COMPARE.tabs.saved}
            <span className="sr-only"> (coming soon)</span>
          </span>
        </li>
      </ul>
    </nav>
  );
}

function TabLink({
  to,
  active,
  children,
}: {
  to: "/careers" | "/careers/compare";
  active: boolean;
  children: string;
}) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={clsx(
        tabBase,
        "focus-ring transition-colors duration-200 ease-out motion-reduce:transition-none",
        active
          ? "bg-brand-100 text-brand-700"
          : "border border-grey-50 bg-surface text-grey-600 hover:bg-grey-50",
      )}
    >
      {children}
    </Link>
  );
}