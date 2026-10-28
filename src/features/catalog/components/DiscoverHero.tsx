import { Skeleton } from "../../../components/ui/Skeleton";
import { PathwayHero } from "@/components/PathwayHero";

interface DiscoverHeroProps {
  /** Published careers in the full catalogue: undefined while loading, null if it failed. */
  pathwayCount?: number | null;
}

export function DiscoverHero({ pathwayCount }: DiscoverHeroProps) {
  return (
    <PathwayHero
      headingId="discover-heading"
      title="Discover Pathways"
      description={
        "Structured career lanes - frontend, data, design and more. Open one to see what the work involves, pay, outlook and a step-by-step roadmap."
      }
    >
      {pathwayCount !== null && (
        <dl className="mt-6">
          <dt className="text-body-md text-ink-muted">Pathways</dt>
          <dd className="mt-1 font-display text-2xl text-ink">
            {pathwayCount === undefined ? (
              <Skeleton className="mt-1 h-7 w-10" />
            ) : (
              pathwayCount
            )}
          </dd>
        </dl>
      )}
    </PathwayHero>
  );
}
