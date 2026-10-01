import { SlidersHorizontal } from "lucide-react";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Skeleton } from "../../../components/ui/Skeleton";
import { StateMessage } from "../../../components/ui/StateMessage";
import { CAREER_LEVELS } from "../../../types/career.types";
import { toApiLevel, type CareerListItem } from "../catalog.types";
import { hasActiveFilter, useSession } from "../../../lib/stores/session";
import { useCareers } from "../hooks/useCareers";
import { useFields } from "../hooks/useFields";
import { LevelSwitcher } from "./LevelSwitcher";

export default function Catalogue() {
  const profile = useSession();
  const { level, setLevel, interest, setInterest } = profile;
  const filtered = hasActiveFilter(profile);
  const { data, isPending, isError, isPlaceholderData, refetch } = useCareers({
    level: toApiLevel(level),
    interest: interest ?? undefined,
  });
  const { data: fields } = useFields();

  const interestLabel = fields?.find((f) => f.slug === interest)?.name ?? interest;
  const levelLabel = CAREER_LEVELS.find((l) => l.id === level)?.label;
  const clearInterest = () => setInterest(null);

  return (
    <main className="px-page-mobile sm:px-page-tablet lg:px-page-desktop xl:px-page-wide py-8">
      <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Explore careers
          </h1>
          <p className="mt-1 text-ink-muted">
            Open any career to see what the work involves, pay, outlook and a
            roadmap.
          </p>
        </div>
        <LevelSwitcher value={level} onChange={setLevel} />
      </div>

      {filtered && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-brand-100 bg-brand-50/60 p-3">
          <SlidersHorizontal className="size-4 text-brand-700" />
          <span className="text-sm text-ink-muted">Showing matches for</span>
          <Badge tone="brand">{interestLabel}</Badge>
          <div className="ml-auto flex gap-3">
            <Link
              to="/careers/onboarding/about"
              className="text-sm font-medium text-brand-700 hover:underline cursor-pointer"
            >
              Edit
            </Link>
            <button
              onClick={clearInterest}
              className="text-sm font-medium text-brand-700 hover:underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {isPending ? (
        <LoadingGrid />
      ) : isError ? (
        <StateMessage
          kind="error"
          title="We couldn’t load careers"
          body="Something went wrong on our side or with your connection. Please try again."
          action={
            <Button onClick={() => refetch()} className="cursor-pointer">
              Try again
            </Button>
          }
        />
      ) : (
        <div
          aria-busy={isPlaceholderData}
          className={clsx(
            "transition-opacity",
            isPlaceholderData && "pointer-events-none opacity-60",
          )}
        >
          <Results
            careers={data}
            interestLabel={filtered ? interestLabel : null}
            levelLabel={levelLabel}
            clearInterest={clearInterest}
          />
        </div>
      )}
    </main>
  );
}

interface ResultsProps {
  careers: CareerListItem[];
  interestLabel: string | null;
  levelLabel?: string;
  clearInterest: () => void;
}

function Results({
  careers,
  interestLabel,
  levelLabel,
  clearInterest,
}: ResultsProps) {
  if (careers.length === 0) {
    if (interestLabel) {
      return (
        <StateMessage
          kind="no-match"
          title="No careers match your interest"
          body={
            levelLabel
              ? `We don’t have ${interestLabel} careers for ${levelLabel.toLowerCase()}s yet. Try another level, or clear your interest to see everything.`
              : `We don’t have ${interestLabel} careers yet. Clear your interest to see everything.`
          }
          action={
            <Button onClick={clearInterest} className="cursor-pointer">
              Clear interest
            </Button>
          }
        />
      );
    }

    if (levelLabel) {
      return (
        <StateMessage
          kind="no-match"
          title={`No careers for ${levelLabel.toLowerCase()}s yet`}
          body="Try another level above. We're adding careers to the catalogue regularly."
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
      <p className="mb-3 text-sm text-ink-subtle" aria-live="polite">
        {careers.length} {careers.length === 1 ? "career" : "careers"}
      </p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {careers.map((c) => (
          <li key={c.id}>
            <Link
              to="/careers/$careerId"
              params={{ careerId: c.slug }}
              className="group block h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg"
            >
              <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-raised">
                <h2 className="font-display text-base font-semibold text-ink">
                  {c.title}
                </h2>
                <p className="mt-1 flex-1 text-sm text-ink-muted">
                  {c.shortDescription}
                </p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function LoadingGrid() {
  return (
    <div role="status" aria-live="polite">
      <p className="mb-3 text-sm text-ink-subtle">Loading careers…</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="mt-3 h-3.5 w-full" />
            <Skeleton className="mt-2 h-3.5 w-4/5" />
          </Card>
        ))}
      </div>
    </div>
  );
}
