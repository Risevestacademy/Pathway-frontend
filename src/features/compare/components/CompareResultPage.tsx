import { getRouteApi } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import type { UseQueryResult } from "@tanstack/react-query";
import { Button, LinkButton } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { StateMessage } from "@/components/ui/StateMessage";
import CareerFrame from "@/features/careerDetail/components/CareerFrame";
import { useCareer } from "@/features/careerDetail/hooks/useCareer";
import { useCareerPathway } from "@/features/explore/hooks/useCareerPathway";
import { BackLinkTo } from "@/features/skillCheck/components/BackLink";
import type { Career } from "@/types/career.types";
import { COMPARE } from "../compare.copy";
import CompareHeaderCard from "./CompareHeaderCard";
import CompareTable, { cardsPad, columns} from "./CompareTable";
import StickyCompareBar from "./StickyCompareBar";
import clsx from "clsx";

const route = getRouteApi("/careers/compare/result");
const R = COMPARE.result;

export default function CompareResultPage() {
  const { a, b } = route.useSearch();
  const pair = a && b && a !== b ? { first: a, second: b } : null;

  return (
    <CareerFrame>
      <BackLinkTo
        to="/careers/compare"
        search={{ a, b }}
        label={R.back}
      />
      <header className="mb-8 flex flex-col gap-1">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">
          {R.title}
        </h1>
        <p className="text-base leading-5 text-grey-600">{R.subtitle}</p>
      </header>

      {pair ? (
        <CompareResult firstId={pair.first} secondId={pair.second} />
      ) : (
        <StateMessage
          kind="empty"
          title={R.pairMissingTitle}
          body={R.pairMissingBody}
          action={<LinkButton to="/careers/compare">{R.choose}</LinkButton>}
        />
      )}
    </CareerFrame>
  );
}

function isMissing(query: UseQueryResult<Career>): boolean {
  const status = isAxiosError(query.error) ? query.error.response?.status : undefined;
  return query.isError && (status === 404 || status === 400);
}

function CompareResult({ firstId, secondId }: { firstId: string; secondId: string }) {
  const first = useCareer(firstId);
  const second = useCareer(secondId);
  const firstPathway = useCareerPathway(firstId);
  const secondPathway = useCareerPathway(secondId);

  if (first.isPending || second.isPending) return <ResultSkeleton />;

  const missing =
    isMissing(first) ||
    isMissing(second) ||
    (first.data !== undefined && first.data.status !== "published") ||
    (second.data !== undefined && second.data.status !== "published");

  if (missing) {
    // Keep the career that did load, so one pick is not lost.
    const keep = first.data?.status === "published" ? firstId : second.data?.status === "published" ? secondId : undefined;
    return (
      <StateMessage
        kind="no-match"
        title={R.unavailableTitle}
        body={R.unavailableBody}
        action={
          <LinkButton to="/careers/compare" search={{ a: keep }}>
            {R.choose}
          </LinkButton>
        }
      />
    );
  }

  if (first.isError || second.isError || !first.data || !second.data) {
    return (
      <StateMessage
        kind="error"
        title={R.errorTitle}
        body={R.errorBody}
        action={
          <Button
            onClick={() => {
              if (first.isError) void first.refetch();
              if (second.isError) void second.refetch();
            }}
          >
            {COMPARE.picker.retry}
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 ease-out motion-reduce:animate-none">
      <div className={clsx("grid gap-4 md:gap-x-6", columns, cardsPad)}>
        <div aria-hidden className="hidden md:block" />
        <CompareHeaderCard career={first.data} otherId={secondId} />
        <CompareHeaderCard career={second.data} otherId={firstId} />
      </div>

      {/* The bar sticks only while this wrapper, and so the table, is on screen. */}
      <div className="relative">
        <StickyCompareBar careers={[first.data, second.data]} />
        <CompareTable
          first={first.data}
          second={second.data}
          firstPathway={firstPathway}
          secondPathway={secondPathway}
        />
      </div>

      <p className="text-sm leading-5 text-grey-600">{R.footnote}</p>
    </div>
  );
}

function ResultSkeleton() {
  return (
    <div role="status" aria-label="Loading the comparison" className="flex flex-col gap-6">
      <div className={clsx("grid gap-4 md:gap-x-6", columns, cardsPad)}>
        <div aria-hidden className="hidden md:block" />
        <Skeleton className="h-44 rounded-[28px]" />
        <Skeleton className="h-44 rounded-[28px]" />
      </div>
      <div className="flex flex-col gap-px overflow-hidden rounded-[28px] border border-grey-100 bg-surface p-6">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="py-4">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="mt-3 h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}