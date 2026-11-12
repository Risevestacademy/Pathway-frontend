import { useDeferredValue, useState } from "react";
import { Link, getRouteApi } from "@tanstack/react-router";
import clsx from "clsx";
import { ArrowRightRegular } from "@mingcute/react/core-regular";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Skeleton } from "../../../components/ui/Skeleton";
import { StateMessage } from "../../../components/ui/StateMessage";
import { CAREER_LEVELS, type CareerLevel } from "../../../types/career.types";
import CareerFrame from "../../careerDetail/components/CareerFrame";
import ExploreTabs from "../../explore/components/ExploreTabs";
import { matchesQuery } from "../../explore/explore.utils";
import { NO_INTEREST, type CareerListItem } from "../catalog.types";
import {
  getCatalogueFilters,
  getCatalogueTabs,
  resolveView,
  type CatalogueView,
} from "../catalog.utils";
import { useSession } from "../../../lib/stores/session";
import { useCareers } from "../hooks/useCareers";
import { useFields } from "../hooks/useFields";
import { CareerFilterBar } from "./CareerFilterBar";
import { CatalogueEmptyState } from "./CatalogueEmptyState";
import { CatalogueTabs } from "./CatalogueTabs";
import { DiscoverHero } from "./DiscoverHero";
import { FilterSelect } from "./FilterSelect";

const route = getRouteApi("/careers/");

export default function Catalogue() {
  const { q } = route.useSearch();
  const navigate = route.useNavigate();
  const query = q ?? "";
  const deferredQuery = useDeferredValue(query);
  const setQuery = (value: string) =>
    void navigate({
      search: { q: value.trim() ? value : undefined },
      replace: true,
      resetScroll: false,
    });
  const { level, interest, setLevel, setInterest } = useSession();
  const levelLabel = CAREER_LEVELS.find((l) => l.id === level)?.label;

  const tabs = getCatalogueTabs(levelLabel, interest !== null);
  const [selectedView, setSelectedView] = useState<CatalogueView>(tabs[0].id);
  const view = resolveView(selectedView, tabs);

  const { data, isPending, isError, isPlaceholderData, refetch } = useCareers(
    getCatalogueFilters(view, level, interest),
  );

  const fields = useFields();

  const matches = (data ?? []).filter((career) =>
    matchesQuery([career.title, career.shortDescription], deferredQuery),
  );

  const interestLabel =
    fields.data?.find((f) => f.slug === interest)?.name ?? interest;

  const changeLevel = (next: string) => {
    setLevel(next as CareerLevel);
    setSelectedView(interest ? "recommended" : "level");
  };
  const changeInterest = (next: string) => {
    const nextInterest = next === NO_INTEREST ? null : next;
    setInterest(nextInterest);
    setSelectedView(nextInterest ? "recommended" : "level");
  };

  return (
    <CareerFrame>
      <ExploreTabs current="careers" />

      <DiscoverHero />

      <CareerFilterBar
        query={query}
        onQueryChange={setQuery}
        tabs={
          <CatalogueTabs tabs={tabs} value={view} onChange={setSelectedView} />
        }
      >
        <FilterSelect
          label="Level"
          placeholder="Choose"
          value={level ?? ""}
          onValueChange={changeLevel}
          options={CAREER_LEVELS.map((l) => ({ value: l.id, label: l.label }))}
        />
        <FilterSelect
          label="Interest"
          placeholder="Any field"
          value={interest ?? ""}
          onValueChange={changeInterest}
          disabled={!fields.data}
          options={[
            { value: NO_INTEREST, label: "Any field" },
            ...(fields.data ?? []).map((f) => ({
              value: f.slug,
              label: f.name,
            })),
          ]}
        />
      </CareerFilterBar>

      <div className="mt-6">
        {isPending ? (
          <LoadingGrid />
        ) : isError ? (
          <StateMessage
            kind="error"
            title="We couldn’t load careers"
            body="Something went wrong on our side or with your connection. Please try again."
            action={<Button onClick={() => refetch()}>Try again</Button>}
          />
        ) : (
          <div
            aria-busy={isPlaceholderData}
            className={clsx(
              "transition-opacity motion-reduce:transition-none",
              isPlaceholderData && "pointer-events-none opacity-60",
            )}
          >
            {data.length === 0 ? (
              <CatalogueEmptyState
                view={view}
                interestLabel={interestLabel}
                levelLabel={levelLabel}
                onShowAll={() => setSelectedView("all")}
              />
            ) : matches.length === 0 ? (
              <StateMessage
                kind="no-match"
                title="No careers match your search"
                body="Try a different word, or clear the search to see every career in this view."
                action={
                  <Button isPrimary={false} onClick={() => setQuery("")}>
                    Clear search
                  </Button>
                }
              />
            ) : (
              <CareerGrid careers={matches} />
            )}
          </div>
        )}
      </div>
    </CareerFrame>
  );
}

function CareerGrid({ careers }: { careers: CareerListItem[] }) {
  return (
    <>
      <p className="sr-only" aria-live="polite">
        {careers.length} {careers.length === 1 ? "career" : "careers"}
      </p>
      <ul className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {careers.map((c) => (
          <li key={c.id}>
            <CareerCard career={c} />
          </li>
        ))}
      </ul>
    </>
  );
}

function CareerCard({ career }: { career: CareerListItem }) {
  return (
    <Link
      to="/careers/$careerId"
      params={{ careerId: career.id }}
      className="group block h-full cursor-pointer rounded-lg focus-ring focus-visible:ring-offset-2"
    >
      <Card className="flex h-full flex-col p-6 transition-shadow group-hover:shadow-raised motion-reduce:transition-none">
        <h2 className="font-display text-body-lg-bold text-ink">
          {career.title}
        </h2>
        <p className="mt-2 flex-1 text-body-md text-ink-muted">
          {career.shortDescription}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-body-md text-brand-600">
          Open Pathway
          <ArrowRightRegular
            size={18}
            aria-hidden
            className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </span>
      </Card>
    </Link>
  );
}

function LoadingGrid() {
  return (
    <div role="status" aria-label="Loading careers">
      <ul className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i}>
            <Card className="p-6">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="mt-4 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-4/5" />
              <Skeleton className="mt-6 h-4 w-32" />
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
