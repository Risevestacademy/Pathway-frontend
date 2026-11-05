import clsx from "clsx";
import { useId } from "react";
import { ArrowRightRegular } from "@mingcute/react/core-regular";
import { Compass } from "lucide-react";
import { LinkButton } from "../../../components/ui/Button";

export interface PathwayCardProps {
  careerId: string;
  title: string;
  isActive: boolean;
  /** The career's picture and the tint of the tile behind it. */
  icon?: { src: string; tint: string };
  /** Where they are in the pathway, or null when there is no step to show. */
  currentStep: { title: string; description: string } | null;
  xp: number;
}

/** One career pathway: where the person is in it, and a way to carry on. */
export function PathwayCard({
  careerId,
  title,
  isActive,
  icon,
  currentStep,
  xp,
}: PathwayCardProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-6 rounded-3xl border border-line bg-surface p-6"
    >
      <header className="flex items-center gap-3 border-b border-line pb-6">
        {icon && (
          <span className={clsx("grid size-10 shrink-0 place-items-center rounded-lg", icon.tint)}>
            <img src={icon.src} alt="" aria-hidden draggable={false} className="max-h-6 w-auto" />
          </span>
        )}
        <h2 id={headingId} className="font-display text-2xl font-medium text-ink">
          {title}
        </h2>
        {isActive && (
          <span className="rounded bg-brand-100 px-2 py-1 text-xs font-medium tracking-wide text-brand-700 uppercase">
            Active
          </span>
        )}
      </header>

      <div role="group" aria-label="Currently at" className="rounded-2xl bg-surface-muted p-5">
        <p className="text-sm text-ink-muted">Currently at:</p>
        {currentStep ? (
          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="border-l-4 border-success-600 pl-3">
              <p className="text-lg font-medium text-ink">{currentStep.title}</p>
              <p className="text-ink-muted">{currentStep.description}</p>
            </div>
            <p className="flex shrink-0 items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-ink-muted">
              <Compass className="size-4 text-brand-500" aria-hidden />
              {xp} XP
            </p>
          </div>
        ) : (
          <p className="mt-3 text-ink-muted">No steps to show yet</p>
        )}
      </div>

      <LinkButton
        to="/careers/$careerId/roadmap"
        params={{ careerId }}
        className="group w-full justify-center"
      >
        <span className="inline-flex items-center gap-1.5">
          Continue roadmap
          <ArrowRightRegular
            size={18}
            aria-hidden
            className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </span>
      </LinkButton>
    </section>
  );
}
