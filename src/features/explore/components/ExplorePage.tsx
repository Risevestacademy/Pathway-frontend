import clsx from "clsx";
import { useDeferredValue, useMemo } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { AlertTriangle, SearchX } from "lucide-react";
import StateMessage from "@/components/StateMessage";
import { useCareers } from "@/features/catalog/hooks/useCareers";
import { useFields } from "@/features/catalog/hooks/useFields";
import { toApiLevel } from "@/features/catalog/catalog.types";
import { container } from "@/features/landing/landing.styles";
import { LandingButton } from "@/features/landing/components/LandingButton";
import PublicPageLayout from "@/features/landing/components/PublicPageLayout";
import { EXPLORE_LIST } from "../explore.copy";
import type { ExploreSearch } from "../explore.search";
import { matchesQuery } from "../explore.utils";
import { useCareerDetails } from "../hooks/useCareerDetails";
import CareerFilters from "./CareerFilters";
import ExploreCareerCard, { ExploreCareerCardSkeleton } from "./ExploreCareerCard";
import ExploreHero from "./ExploreHero";
import PathwayCtaSection from "./PathwayCtaSection";

const route = getRouteApi("/explore/");

/**
 * Public career catalogue at /explore. Career stage and field go to the API
 * (GET /careers?level=&interest=), mirroring the in-app catalogue; the search
 * box filters the returned list on title, description, field and skills.
 * All three live in the URL.
 */
export default function ExplorePage() {
  const search = route.useSearch();
  const navigate = route.useNavigate();
  const query = search.q ?? "";
  const deferredQuery = useDeferredValue(query);

  const setSearch = (patch: Partial<ExploreSearch>) =>
    void navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        // Drop empty values so the URL stays clean.
        return {
          q: next.q?.trim() ? next.q : undefined,
          level: next.level,
          field: next.field,
        };
      },
      replace: true,
      resetScroll: false,
    });

  const params = { level: toApiLevel(search.level ?? null), interest: search.field };
  const careers = useCareers(params);
  const fields = useFields();
  const list = useMemo(() => careers.data ?? [], [careers.data]);
  const details = useCareerDetails(list.map((career) => career.id));

  const visible = list.filter((career) => {
    const detail = details.get(career.id);
    return matchesQuery(
      [career.title, career.shortDescription, detail?.field?.name, ...(detail?.tags ?? [])],
      deferredQuery,
    );
  });

  const hasFilters = Boolean(search.q || search.level || search.field);

  return (
    <PublicPageLayout bandClassName="h-[520px] md:h-[620px] lg:h-[750px]">
      <ExploreHero />

      <section
        id={EXPLORE_LIST.anchor}
        aria-label="Careers"
        className="scroll-mt-28 pt-12 lg:pt-20"
      >
        <div className={container}>
          <CareerFilters
            query={query}
            level={search.level}
            field={search.field}
            fields={fields.data ?? []}
            onQueryChange={(q) => setSearch({ q })}
            onLevelChange={(level) => setSearch({ level })}
            onFieldChange={(field) => setSearch({ field })}
          />

          <div className="mt-14 lg:mt-20" aria-live="polite" aria-busy={careers.isFetching}>
            {careers.isError ? (
              <StateMessage
                icon={AlertTriangle}
                variant="error"
                title={EXPLORE_LIST.errorTitle}
                body={EXPLORE_LIST.errorBody}
                action={<LandingButton onClick={() => void careers.refetch()}>{EXPLORE_LIST.retry}</LandingButton>}
              />
            ) : careers.isPending ? (
              <div className="grid gap-5 md:grid-cols-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <ExploreCareerCardSkeleton key={i} />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <StateMessage
                icon={SearchX}
                title={EXPLORE_LIST.emptyTitle}
                body={EXPLORE_LIST.emptyBody}
                action={
                  hasFilters ? (
                    <LandingButton
                      variant="secondary"
                      onClick={() => setSearch({ q: undefined, level: undefined, field: undefined })}
                    >
                      {EXPLORE_LIST.clearFilters}
                    </LandingButton>
                  ) : undefined
                }
              />
            ) : (
              <ul
                className={clsx(
                  "grid gap-5 md:grid-cols-2",
                  "transition-opacity duration-200 motion-reduce:transition-none",
                  careers.isPlaceholderData && "opacity-60",
                )}
              >
                {visible.map((career) => (
                  <li key={career.id} className="flex">
                    <div className="w-full">
                      <ExploreCareerCard career={career} detail={details.get(career.id)} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <PathwayCtaSection />
    </PublicPageLayout>
  );
}
