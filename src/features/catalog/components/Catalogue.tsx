import { useState } from "react";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { ArrowRightRegular } from "@mingcute/react/core-regular";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Skeleton } from "../../../components/ui/Skeleton";
import { StateMessage } from "../../../components/ui/StateMessage";
import { CAREER_LEVELS } from "../../../types/career.types";
import { toApiLevel, type CareerListItem } from "../catalog.types";
import { useSession } from "../../../lib/stores/session";
import { useCareers } from "../hooks/useCareers";
import { useFields } from "../hooks/useFields";
import { CatalogueTabs, type CatalogueTab } from "./CatalogueTabs";
import { DiscoverHero } from "./DiscoverHero";

type View = "recommended" | "level" | "all";

export default function Catalogue() {
  const { level, interest } = useSession();
  const levelLabel = CAREER_LEVELS.find((l) => l.id === level)?.label;

  const tabs = [
    interest && { id: "recommended", label: "Recommended" },
    levelLabel && { id: "level", label: levelLabel },
    { id: "all", label: "All" },
  ].filter(Boolean) as CatalogueTab<View>[];

  const [view, setView] = useState<View>(tabs[0].id);

  const { data, isPending, isError, isPlaceholderData, refetch } = useCareers({
    level: view === "all" ? undefined : toApiLevel(level),
    interest: view === "recommended" ? (interest ?? undefined) : undefined,
  });
  const allCareers = useCareers({});
  const { data: fields } = useFields();

  const interestLabel = fields?.find((f) => f.slug === interest)?.name ?? interest;

  return (
    <main className="flex flex-1 flex-col px-page-mobile py-6 sm:px-page-tablet lg:px-10 lg:py-10">
      <DiscoverHero
        pathwayCount={allCareers.isError ? null : allCareers.data?.length}
      />

      {tabs.length > 1 && (
        <div className="mt-8">
          <CatalogueTabs tabs={tabs} value={view} onChange={setView} />
        </div>
      )}

      <div className="mt-8">
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
            <Results
              careers={data}
              view={view}
              interestLabel={interestLabel}
              levelLabel={levelLabel}
              showAll={() => setView("all")}
            />
          </div>
        )}
      </div>
    </main>
  );
}

interface ResultsProps {
  careers: CareerListItem[];
  view: View;
  interestLabel: string | null;
  levelLabel?: string;
  showAll: () => void;
}

function Results({
  careers,
  view,
  interestLabel,
  levelLabel,
  showAll,
}: ResultsProps) {
  if (careers.length === 0) {
    const seeAll = <Button onClick={showAll}>See all careers</Button>;

    if (view === "recommended") {
      return (
        <StateMessage
          kind="no-match"
          title="No careers match your interest yet"
          body={
            levelLabel
              ? `We don’t have ${interestLabel} careers for ${levelLabel.toLowerCase()}s yet. See all careers to browse the full catalogue.`
              : `We don’t have ${interestLabel} careers yet. See all careers to browse the full catalogue.`
          }
          action={seeAll}
        />
      );
    }

    if (view === "level" && levelLabel) {
      return (
        <StateMessage
          kind="no-match"
          title={`No careers for ${levelLabel.toLowerCase()}s yet`}
          body="We're adding careers to the catalogue regularly. See all careers to browse the full catalogue."
          action={seeAll}
        />
      );
    }

    return (
      <StateMessage
        kind="empty"
        title="No careers available yet"
        body="We're adding careers to the catalogue. Check back soon."
      />
    );
  }

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {careers.length} {careers.length === 1 ? "career" : "careers"}
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      <Card className="flex h-full flex-col p-6 transition-shadow group-hover:shadow-raised motion-reduce:transition-none lg:p-8">
        <h2 className="font-display text-body-lg-bold text-ink">{career.title}</h2>
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
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i}>
            <Card className="p-6 lg:p-8">
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
