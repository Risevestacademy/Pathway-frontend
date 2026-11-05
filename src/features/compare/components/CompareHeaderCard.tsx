import { Link } from "@tanstack/react-router";
import CareerIconTile from "@/features/explore/components/CareerIconTile";
import type { Career } from "@/types/career.types";
import { COMPARE } from "../compare.copy";

export default function CompareHeaderCard({
  career,
  otherId,
}: {
  career: Career;
  otherId: string;
}) {
  return (
    <section
      aria-label={career.title}
      className="flex min-w-0 flex-col gap-5 rounded-[28px] border border-grey-100 bg-surface p-6 lg:p-8"
    >
      <div className="flex min-h-8 flex-wrap items-center justify-between gap-x-3 gap-y-2 md:flex-col md:items-start md:justify-start lg:flex-row lg:items-center lg:justify-between">
        {career.field ? (
          <span className="inline-flex max-w-full rounded-lg bg-grey-100 px-3 py-1.5 text-xs leading-5 font-medium whitespace-nowrap text-grey-600">
            {career.field.name}
          </span>
        ) : (
          <span />
        )}
        <Link
          to="/careers/compare"
          search={{ a: otherId }}
          className="focus-ring rounded-sm text-sm leading-5 font-medium text-brand-600 underline hover:text-brand-700"
        >
          {COMPARE.result.change}
          <span className="sr-only"> {career.title}</span>
        </Link>
      </div>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:gap-4 md:flex-col md:gap-3 lg:flex-row lg:gap-4">
        <CareerIconTile slug={career.slug ?? ""} size={64} className="rounded-2xl" />
        <div className="min-w-0">
          <h2 className="text-2xl leading-7 font-medium wrap-break-word text-ink md:text-xl lg:text-2xl">
            {career.title}
          </h2>
          <p className="mt-1 text-sm leading-5 text-grey-600">{career.description}</p>
        </div>
      </div>
    </section>
  );
}