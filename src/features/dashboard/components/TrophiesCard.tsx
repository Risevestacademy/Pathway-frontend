import { useId } from "react";
import trophy from "../../../assets/images/dashboard/trophy.png";

const SLOTS = 5;

/** Trophies aren't tracked by the backend yet: none earned, five still to unlock. */
export function TrophiesCard() {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5"
    >
      <h3 id={headingId} className="text-base font-medium text-ink-muted">
        Trophies
      </h3>
      <p className="flex items-center gap-2 font-display text-3xl font-medium text-ink">
        <img src={trophy} alt="" aria-hidden className="size-6" />0
      </p>
      <ul aria-label="Trophies to earn" className="flex flex-wrap gap-3">
        {Array.from({ length: SLOTS }, (_, index) => (
          <li
            key={index}
            className="grid size-16 place-items-center rounded-full bg-grey-50 shadow-[inset_0_-3px_0_var(--color-grey-100)]"
          >
            <span
              aria-hidden
              className="grid size-10 place-items-center rounded-full bg-grey-100 font-medium text-grey-300"
            >
              ?
            </span>
            <span className="sr-only">Locked</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
