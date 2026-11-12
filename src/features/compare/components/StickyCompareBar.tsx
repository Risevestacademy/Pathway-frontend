import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { BELOW_TOP_NAV } from "@/components/appTopNav.layout";
import CareerIconTile from "@/features/explore/components/CareerIconTile";
import type { Career } from "@/types/career.types";
import { columns } from "./CompareTable";

// The table's row padding plus its 1px border, so the names sit over their columns.
const barPad = "px-[calc(1rem+1px)] sm:px-[calc(1.5rem+1px)] lg:px-[calc(2rem+1px)]";

/**
 * Keeps the two careers' names in view while the comparison table scrolls. Put
 * it first inside the table's wrapper: it takes no room, sticks under the top
 * nav, and shows only once the header cards have scrolled away and while the
 * table is still on screen.
 *
 * Decoration only: the table already names each column for screen readers.
 */
export default function StickyCompareBar({ careers }: { careers: [Career, Career] }) {
  const anchor = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const pin = anchor.current;
    const content = bar.current;
    const table = pin?.parentElement;
    if (!pin || !content || !table) return;

    let frame = 0;
    const check = () => {
      frame = 0;
      // Where the pin sticks, which differs by breakpoint.
      const top = parseFloat(getComputedStyle(pin).top) || 0;
      const pinned = pin.getBoundingClientRect().top <= top + 0.5;
      const tableLeft = table.getBoundingClientRect().bottom > top + content.offsetHeight;
      setShown(pinned && tableLeft);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };

    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div ref={anchor} aria-hidden className={clsx("sticky z-10 h-0", BELOW_TOP_NAV)}>
      <div
        ref={bar}
        data-shown={shown}
        className={clsx(
          "absolute inset-x-0 top-0 grid grid-cols-2 items-center gap-x-4 py-3 md:gap-x-6",
          "rounded-b-2xl border-b border-grey-100 bg-surface shadow-raised",
          "transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none",
          shown ? "opacity-100" : "pointer-events-none -translate-y-1 opacity-0",
          barPad,
          columns,
        )}
      >
        <div className="hidden md:block" />
        {careers.map((career) => (
          <div key={career.id} className="flex min-w-0 items-center gap-3">
            <CareerIconTile slug={career.slug ?? ""} size={32} className="rounded-lg" />
            <p className="truncate text-base leading-6 font-medium text-ink">{career.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
