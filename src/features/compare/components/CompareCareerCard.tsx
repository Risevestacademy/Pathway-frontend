import clsx from "clsx";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import CareerIconTile from "@/features/explore/components/CareerIconTile";
import type { CareerListItem } from "@/features/catalog/catalog.types";
import type { Career } from "@/types/career.types";
import { COMPARE } from "../compare.copy";

interface CompareCareerCardProps {
  career: CareerListItem;
  detail: Career | undefined;
  selected: boolean;
  onToggle: () => void;
}

export default function CompareCareerCard({
  career,
  detail,
  selected,
  onToggle,
}: CompareCareerCardProps) {
  const skills = detail?.tags.slice(0, 3) ?? [];

  return (
    <article
      className={clsx(
        "relative flex h-full flex-col rounded-3xl border bg-surface p-6",
        "transition-colors duration-200 motion-reduce:transition-none",
        selected ? "border-brand-500" : "border-grey-100 hover:border-grey-200",
      )}
    >
      <div className="flex min-h-7 items-center justify-between gap-3">
        {detail?.field ? (
          <span className="inline-flex h-7 items-center rounded-lg bg-success-50 px-2 text-sm font-medium text-success-700">
            {detail.field.name}
          </span>
        ) : detail ? (
          <span />
        ) : (
          <Skeleton className="h-7 w-24 rounded-lg" />
        )}
        <span
          aria-hidden
          className={clsx(
            "grid size-6 shrink-0 place-items-center rounded-md border-2 transition-colors duration-150 motion-reduce:transition-none",
            selected
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-grey-900 bg-surface",
          )}
        >
          {selected && <Check className="size-4" strokeWidth={3} />}
        </span>
      </div>

      <div className="mt-3 flex-1">
        <div className="flex items-center gap-3">
          <CareerIconTile slug={career.slug} size={56} />
          <div className="min-w-0">
            <h3 className="text-body-lg text-ink">
              <button
                type="button"
                role="checkbox"
                aria-checked={selected}
                onClick={onToggle}
                className="cursor-pointer rounded-sm text-left outline-none after:absolute after:inset-0 after:rounded-3xl focus-visible:after:ring-2 focus-visible:after:ring-brand-500 focus-visible:after:ring-offset-2"
              >
                {career.title}
              </button>
            </h3>
            <p className="mt-1 text-base leading-5 text-grey-600">
              {career.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-grey-100 pt-6">
        {detail ? (
          <p className="min-w-0 truncate text-base font-medium text-grey-600">
            {skills.map((skill, index) => (
              <span key={skill}>
                {index > 0 && (
                  <span aria-hidden className="mx-1.5">
                    ·
                  </span>
                )}
                {skill}
              </span>
            ))}
          </p>
        ) : (
          <Skeleton className="h-4 w-40" />
        )}
        <Link
          to="/careers/$careerId"
          params={{ careerId: career.id }}
          className="focus-ring relative z-10 inline-flex shrink-0 items-center gap-1.5 rounded-sm text-base font-semibold text-brand-600 hover:text-brand-700"
        >
          {COMPARE.picker.openPathway}
          <span className="sr-only"> for {career.title}</span>
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
    </article>
  );
}

export function CompareCareerCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex flex-col rounded-3xl border border-grey-100 bg-surface p-6"
    >
      <Skeleton className="h-7 w-24 rounded-lg" />
      <div className="mt-3 flex items-center gap-3">
        <Skeleton className="size-14 rounded-[14px]" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <div className="mt-6 border-t border-grey-100 pt-6">
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}