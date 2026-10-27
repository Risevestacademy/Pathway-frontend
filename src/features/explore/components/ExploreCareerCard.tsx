import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import type { CareerListItem } from "@/features/catalog/catalog.types";
import type { Career } from "@/types/career.types";
import { EXPLORE_LIST } from "../explore.copy";
import CareerIconTile from "./CareerIconTile";

// The title link's ::after covers the card, making the whole card one link.
export default function ExploreCareerCard({ career, detail }: { career: CareerListItem; detail: Career | undefined }) {
  const skills = detail?.tags.slice(0, 3) ?? [];

  return (
    <article className="group relative flex flex-col rounded-[28px] border border-grey-100 bg-white p-6 transition-shadow duration-200 hover:shadow-[0_12px_32px_rgb(16_16_29/0.06)] motion-reduce:transition-none">
      <div className="h-7">
        {detail?.field ? (
          <span className="inline-flex h-7 items-center rounded-[6px] bg-landing-mint-card px-2 text-[14px] text-[#009e4d]">
            {detail.field.name}
          </span>
        ) : !detail ? (
          <Skeleton className="h-7 w-28 rounded-[6px]" />
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <CareerIconTile title={career.title} slug={career.slug} size={60} />
        <div className="min-w-0">
          <h3 className="font-landing-body text-lg leading-6 font-medium text-ink">
            <Link
              to="/explore/$careerId"
              params={{ careerId: career.id }}
              className="rounded-sm outline-none after:absolute after:inset-0 after:rounded-[28px] focus-visible:after:ring-2 focus-visible:after:ring-brand-500"
            >
              {career.title}
            </Link>
          </h3>
          <p className="mt-1 font-landing-body text-[15px] leading-5 text-grey-500">{career.shortDescription}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-grey-100 pt-5">
        {detail ? (
          <p className="min-w-0 truncate font-landing-body text-[15px] text-grey-500">
            {skills.map((skill, index) => (
              <span key={skill}>
                {index > 0 && <span aria-hidden className="mx-1.5">·</span>}
                {skill}
              </span>
            ))}
          </p>
        ) : (
          <Skeleton className="h-4 w-44" />
        )}
        <span
          aria-hidden
          className="inline-flex shrink-0 items-center gap-1.5 font-landing-body text-[15px] font-medium text-brand-600"
        >
          {EXPLORE_LIST.openPathway}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </span>
      </div>
    </article>
  );
}

export function ExploreCareerCardSkeleton() {
  return (
    <div aria-hidden className="flex flex-col rounded-[28px] border border-grey-100 bg-white p-6">
      <Skeleton className="h-7 w-28 rounded-[6px]" />
      <div className="mt-3 flex items-center gap-3">
        <Skeleton className="size-[60px] rounded-[14px]" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="mt-6 border-t border-grey-100 pt-5">
        <Skeleton className="h-4 w-44" />
      </div>
    </div>
  );
}
