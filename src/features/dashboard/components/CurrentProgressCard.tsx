import { useId } from "react";
import { ArrowRight } from "lucide-react";
import { LinkButton } from "../../../components/ui/Button";
import { Link } from "@tanstack/react-router";
import ProgressBar from "../../progress/components/ProgressBar";
import cubes from "../../../assets/images/dashboard/progress-cubes.png";
import type { DashboardSummary } from "../dashboard.utils";

/** Progress through the active pathway, or a way to start one. */
export function CurrentProgressCard({ summary }: { summary: DashboardSummary }) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-2"
    >
      <h2 id={headingId} className="px-4 pt-3 text-base font-medium text-ink-muted">
        Current Progress
      </h2>
      <div className="relative flex min-h-48 flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-brand-200 bg-brand-50 p-4">
        <img
          src={cubes}
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute right-0 bottom-0 h-full w-auto max-w-none select-none"
        />
        <p className="relative font-display text-4xl font-medium text-ink">
          {summary.progressPercent}%
        </p>
        <div className="relative flex flex-col gap-3">
          {summary.hasActivePathway ? (
            <>
              <div className="max-w-[60%]">
                <ProgressBar
                  completed={summary.completedSteps}
                  total={summary.totalSteps}
                  label="Current progress"
                />
              </div>
              <Link
                to="/my-pathway"
                className="focus-ring inline-flex w-fit items-center gap-1.5 rounded text-base font-medium text-brand-600"
              >
                Continue your pathway
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </>
          ) : (
            <LinkButton to="/careers" className="w-fit">
              Build my pathway
            </LinkButton>
          )}
        </div>
      </div>
    </section>
  );
}
