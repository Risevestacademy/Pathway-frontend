import heroCubes from "@/assets/images/discover-hero-cubes.svg";
import { Skeleton } from "../../../components/ui/Skeleton";

interface DiscoverHeroProps {
  /** Published careers in the full catalogue: undefined while loading, null if it failed. */
  pathwayCount?: number | null;
}

export function DiscoverHero({ pathwayCount }: DiscoverHeroProps) {
  return (
    <section
      aria-labelledby="discover-heading"
      className="
        relative overflow-hidden rounded-2xl border border-line
        bg-linear-to-r from-surface from-45% to-brand-100
        p-6 sm:p-10 lg:px-14 lg:py-14
      "
    >
      <img
        src={heroCubes}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-auto max-w-[45%] object-cover object-left select-none lg:block"
      />

      <div className="relative lg:max-w-[55%]">
        <h1
          id="discover-heading"
          className="font-display text-4xl font-semibold tracking-tight text-ink lg:text-[2.5rem]"
        >
          Discover Pathways
        </h1>
        <p className="mt-4 max-w-xl text-body-md text-ink-muted">
          Structured career lanes — frontend, data, design and more. Open one
          to see what the work involves, pay, outlook and a step-by-step
          roadmap.
        </p>

        {pathwayCount !== null && (
          <dl className="mt-8">
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
      </div>
    </section>
  );
}
