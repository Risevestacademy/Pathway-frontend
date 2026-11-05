import { useId } from "react";
import { Badge } from "../../../components/ui/Badge";
import ProgressBar from "../../progress/components/ProgressBar";
import { describeProgress } from "../../progress/progress.utils";
import StartTrackingButton from "../../progress/components/StartTrackingButton";

export interface EarlierPathway {
  careerId: string;
  title: string;
  completed: number;
  total: number;
}

/** The pathways they switched away from. Their progress is kept, and they can switch back. */
export function EarlierPathwaysCard({
  pathways,
  activeCareerTitle,
  onSwitched,
}: {
  pathways: EarlierPathway[];
  /** The pathway that would be replaced by switching back to one of these. */
  activeCareerTitle: string | null;
  /** Called with the career once it has been made their active pathway again. */
  onSwitched: (careerId: string) => void;
}) {
  const headingId = useId();
  if (pathways.length === 0) return null;

  return (
    <section
      aria-labelledby={headingId}
      className="overflow-hidden rounded-3xl border border-line bg-surface"
    >
      <header className="p-6">
        <h2 id={headingId} className="font-display text-xl font-medium text-ink">
          Earlier pathways
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          You switched away from these. Your progress on each is kept, so switching back picks up
          where you left off.
        </p>
      </header>

      <ul className="divide-y divide-line border-t border-line">
        {pathways.map((pathway) => (
          <li key={pathway.careerId} className="flex items-center gap-4 px-6 py-5">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-display text-base font-medium text-ink">{pathway.title}</p>
                <Badge tone="warning">Paused</Badge>
              </div>
              <p className="text-sm text-ink-muted">
                {describeProgress(pathway.completed, pathway.total)}
              </p>
              <div className="max-w-xs">
                <ProgressBar
                  completed={pathway.completed}
                  total={pathway.total}
                  label={`${pathway.title} progress`}
                />
              </div>
            </div>
            <StartTrackingButton
              careerId={pathway.careerId}
              careerTitle={pathway.title}
              activeCareerTitle={activeCareerTitle}
              label="Switch back"
              onStarted={() => onSwitched(pathway.careerId)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
