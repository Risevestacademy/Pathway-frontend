import { useId } from "react";
import trophy from "../../../assets/images/dashboard/trophy.png";
import type { DashboardBadgeDto } from "../../../lib/api/dashboard.api";
import { LOCKED_BADGE_ICON, badgeIconAt } from "../badgeIcons";

/** How many badges still to earn are drawn, so a long catalogue doesn't flood the card. */
const MAX_LOCKED_SLOTS = 5;

/** The badges earned so far, then a locked slot for some of the ones still to earn. */
export function TrophiesCard({
  badges,
  earned,
  total,
}: {
  badges: DashboardBadgeDto[];
  earned: number;
  total: number;
}) {
  const headingId = useId();
  const lockedSlots = Math.min(Math.max(total - badges.length, 0), MAX_LOCKED_SLOTS);

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5"
    >
      <h3 id={headingId} className="text-base font-medium text-ink-muted">
        Trophies
      </h3>
      <p className="flex items-center gap-2 font-display text-3xl font-medium text-ink">
        <img src={trophy} alt="" aria-hidden className="size-6" />
        <span>{earned}</span>
        {total > 0 && <span className="text-base font-normal text-ink-muted">of {total}</span>}
      </p>
      {badges.length + lockedSlots > 0 ? (
        <ul aria-label="Trophies" className="flex flex-wrap gap-3">
          {badges.map((badge, index) => (
            <li
              key={badge.id}
              title={badge.description}
              className="flex w-20 flex-col items-center gap-1.5 text-center"
            >
              <img src={badgeIconAt(index)} alt="" draggable={false} className="size-16" />
              <span className="text-xs font-medium text-ink">{badge.name}</span>
            </li>
          ))}
          {Array.from({ length: lockedSlots }, (_, index) => (
            <li key={`locked-${index}`} className="flex w-20 flex-col items-center gap-1.5">
              <img src={LOCKED_BADGE_ICON} alt="" draggable={false} className="size-16" />
              <span className="sr-only">Locked</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted">Trophies you earn will show up here.</p>
      )}
    </section>
  );
}
