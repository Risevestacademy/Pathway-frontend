import clsx from "clsx";
import type { UseQueryResult } from "@tanstack/react-query";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { describeSource, formatMoney } from "@/features/careerDetail/careerDetail.utils";
import {
  experienceLabel,
  payBasisLabel,
  payPeriodSuffix,
} from "@/features/explore/explore.utils";
import type { PathwaySummary } from "@/features/explore/hooks/useCareerPathway";
import type { Career, Statistic } from "@/types/career.types";
import { COMPARE } from "../compare.copy";
import {
  demandStat,
  projectionStat,
  salaryMedians,
  splitSkills,
} from "../compare.utils";

type PathwayQuery = UseQueryResult<PathwaySummary | null>;

const R = COMPARE.result;

export const bodyText = "text-base leading-6 text-grey-600";
const fineText = "text-sm leading-5 text-grey-600";

export function Unavailable({ text }: { text: string }) {
  return (
    <p className="rounded-[10px] bg-unavailable-bg px-3 py-2 text-base leading-6 text-unavailable-ink">
      {text}
    </p>
  );
}

export function Source({ stat }: { stat: Statistic }) {
  return (
    <p className={clsx("mt-0.5", fineText)}>
      {describeSource(stat)}
    </p>
  );
}

export function ExamplesCell({ career }: { career: Career }) {
  const examples = career.workActivities.slice(0, 3);
  if (examples.length === 0) return <p className={bodyText}>{R.noActivities}</p>;
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5 marker:text-grey-500">
      {examples.map((activity) => (
        <li key={activity} className={bodyText}>
          {activity}
        </li>
      ))}
    </ul>
  );
}

export function PayCell({ career }: { career: Career }) {
  const medians = salaryMedians(career);
  if (medians.length === 0) return <Unavailable text={R.payUnavailable} />;

  return (
    <div className="flex flex-col gap-4">
      {medians.map((median) => {
        const context = [
          median.geography,
          payBasisLabel(median.basis),
          experienceLabel(median.experienceLevel),
        ]
          .filter(Boolean)
          .join(" · ");

        return (
          <div key={median.id}>
            {median.value === null ? (
              <p className={bodyText}>{R.noMedian}</p>
            ) : (
              <p className="text-ink">
                <span className="text-lg leading-7 font-medium whitespace-nowrap md:text-2xl">
                  {formatMoney(median.value, median.currency)}
                </span>{" "}
                <span className="text-base text-grey-600">{payPeriodSuffix[median.payPeriod]}</span>
                <span className="sr-only"> median</span>
              </p>
            )}
            <p className={clsx("mt-1", fineText)}>{context}</p>
            <Source stat={median} />
          </div>
        );
      })}
    </div>
  );
}

export function OutlookCell({ career }: { career: Career }) {
  const projection = projectionStat(career);
  const demand = demandStat(career);
  const growth = projection?.value ?? null;

  if (growth === null && !demand?.value) {
    return <Unavailable text={R.growthUnavailable} />;
  }

  const Trend = growth !== null && growth < 0 ? TrendingDown : TrendingUp;

  return (
    <div className="flex flex-col gap-4">
      <div>
        {growth !== null ? (
          <p className="flex flex-wrap items-center gap-x-1.5 text-ink">
            <Trend
              aria-hidden
              className={clsx("size-5", growth < 0 ? "text-danger-600" : "text-success-600")}
            />
            <span className="text-2xl leading-7 font-medium">
              {growth > 0 ? "+" : ""}
              {Number(growth.toFixed(1))}%
            </span>
            <span className="text-base text-grey-600">projected growth</span>
          </p>
        ) : (
          <p className={bodyText}>No growth projection yet.</p>
        )}
        {projection && (
          <p className={clsx("mt-1", fineText)}>
            {[projection.geography, describeSource(projection)].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
      <div>
        <p className={bodyText}>Hiring demand</p>
        <p className="text-xl leading-7 font-medium text-ink">{demand?.value ?? R.notYet}</p>
        {demand && (
          <p className={clsx("mt-0.5", fineText)}>
            {[demand.geography, describeSource(demand)].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}

export function SkillChips({
  skills,
  tone = "neutral",
  emptyText = R.notYet,
}: {
  skills: string[];
  tone?: "neutral" | "shared";
  emptyText?: string;
}) {
  if (skills.length === 0) return <p className={bodyText}>{emptyText}</p>;
  const { shown, hidden } = splitSkills(skills);

  return (
    <ul className="flex flex-wrap gap-2">
      {shown.map((skill) => (
        <li
          key={skill}
          className={clsx(
            "rounded-lg border px-3 py-1.5 text-sm leading-5 font-medium",
            tone === "shared"
              ? "border-brand-100 bg-brand-50 text-brand-700"
              : "border-grey-100 bg-grey-50 text-grey-600",
          )}
        >
          {skill}
        </li>
      ))}
      {hidden > 0 && (
        <li className="px-1 py-1.5 text-sm leading-5 text-grey-600">+{hidden} more</li>
      )}
    </ul>
  );
}

export function FirstStepCell({ pathway }: { pathway: PathwayQuery }) {
  if (pathway.isPending) return <Skeleton className="h-5 w-3/4" />;
  if (pathway.isError) return <p className={bodyText}>{R.firstStepError}</p>;
  return <p className={bodyText}>{pathway.data?.firstStep ?? R.notYet}</p>;
}