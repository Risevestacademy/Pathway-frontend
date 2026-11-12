import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { StateMessage } from "@/components/ui/StateMessage";
import type { CareerListItem } from "@/features/catalog/catalog.types";
import type { Career } from "@/types/career.types";
import { COMPARE } from "../compare.copy";
import CompareCareerCard, {
  CompareCareerCardSkeleton,
} from "./CompareCareerCard";

interface CareerListProps {
  isError: boolean;
  isPending: boolean;
  isRefreshing: boolean;
  matches: CareerListItem[];
  shown: CareerListItem[];
  details: Map<string, Career>;
  selectedIds: string[];
  hasFilters: boolean;
  onRetry: () => void;
  onToggle: (id: string) => void;
  onShowMore: () => void;
  onClearFilters: () => void;
}

export default function CareerList({
  isError,
  isPending,
  isRefreshing,
  matches,
  shown,
  details,
  selectedIds,
  hasFilters,
  onRetry,
  onToggle,
  onShowMore,
  onClearFilters,
}: CareerListProps) {
  return (
    <section aria-label={COMPARE.picker.listLabel} className="mt-4">
      {isError ? (
        <StateMessage
          kind="error"
          title={COMPARE.picker.errorTitle}
          body={COMPARE.picker.errorBody}
          action={<Button onClick={onRetry}>{COMPARE.picker.retry}</Button>}
        />
      ) : isPending ? (
        <div role="status" aria-label="Loading careers">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i}>
                <CompareCareerCardSkeleton />
              </li>
            ))}
          </ul>
        </div>
      ) : matches.length === 0 ? (
        hasFilters ? (
          <StateMessage
            kind="no-match"
            title={COMPARE.picker.noMatchTitle}
            body={COMPARE.picker.noMatchBody}
            action={
              <Button isPrimary={false} onClick={onClearFilters}>
                {COMPARE.picker.clearFilters}
              </Button>
            }
          />
        ) : (
          <StateMessage
            kind="empty"
            title={COMPARE.picker.noneTitle}
            body={COMPARE.picker.noneBody}
          />
        )
      ) : (
        <div
          aria-busy={isRefreshing}
          className={clsx(
            "transition-opacity duration-200 motion-reduce:transition-none",
            isRefreshing && "pointer-events-none opacity-60",
          )}
        >
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((career) => (
              <li key={career.id}>
                <CompareCareerCard
                  career={career}
                  detail={details.get(career.id)}
                  selected={selectedIds.includes(career.id)}
                  onToggle={() => onToggle(career.id)}
                />
              </li>
            ))}
          </ul>
          {matches.length > shown.length && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <p className="text-base text-grey-600">
                Showing {shown.length} of {matches.length} careers
              </p>
              <Button isPrimary={false} onClick={onShowMore}>
                {COMPARE.picker.showMore}
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}