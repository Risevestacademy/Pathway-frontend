import clsx from "clsx";
import { Info, MapPin, TrendingDown, TrendingUp } from "lucide-react";
import { formatMoney } from "@/features/careerDetail/careerDetail.utils";
import type {
  Career,
  DemandStat,
  ProjectionStat,
  SalaryMedianStat,
  SalaryRangeStat,
  Statistic,
} from "@/types/career.types";
import { CAREER_PROFILE } from "../../explore.copy";
import { experienceLabel, payBasisLabel, payPeriodSuffix, projectionPoints } from "../../explore.utils";
import GrowthChart from "./GrowthChart";
import { geoChip, innerCard, panel, panelTitle, sourceNote } from "./profile.styles";

function Geo({ name }: { name: string }) {
  return (
    <span className={geoChip}>
      <MapPin aria-hidden className="size-3.5" strokeWidth={1.75} />
      {name}
    </span>
  );
}

function Source({ stat }: { stat: Statistic }) {
  return (
    <p className={sourceNote}>
      <Info aria-hidden className="size-3.5 shrink-0" strokeWidth={1.75} />
      {stat.source}, {stat.period}
    </p>
  );
}

function Unavailable({ text }: { text: string }) {
  return (
    <p className="rounded-[10px] bg-unavailable-bg px-3 py-2 font-landing-body text-[15px] text-unavailable-ink">{text}</p>
  );
}

function SalaryCard({ median, range }: { median: SalaryMedianStat; range: SalaryRangeStat | undefined }) {
  const basis = payBasisLabel(median.basis);
  const experience = experienceLabel(median.experienceLevel);
  const isEntry = median.experienceLevel === "entry-level";
  const low = range?.low.value;
  const high = range?.high.value;

  return (
    <article className={innerCard} aria-label={`Pay in ${median.geography}`}>
      <Geo name={median.geography} />
      <p className="mt-4 font-landing-body text-ink">
        {median.value === null ? (
          <span className="text-[15px] text-unavailable-ink">The source does not give a median for this role.</span>
        ) : (
          <>
            <span className="text-2xl font-medium">{formatMoney(median.value, median.currency)}</span>{" "}
            <span className="text-base text-grey-500">{payPeriodSuffix[median.payPeriod]}</span>
            <span className="sr-only"> median</span>
          </>
        )}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {basis && <span className={chip}>{basis}</span>}
        {experience && (
          <span className={clsx(chip, isEntry && "bg-[#cce8ff] text-[#1d6fd8]")}>{experience}</span>
        )}
      </div>
      {low != null && high != null && (
        <p className="mt-4 font-landing-body text-[15px] text-grey-600">
          Middle half earn {formatMoney(low, median.currency)} – {formatMoney(high, median.currency)}
        </p>
      )}
      <hr className="my-4 border-grey-100" />
      <Source stat={median} />
    </article>
  );
}

const chip = "inline-flex h-7 items-center rounded-[6px] bg-grey-50 px-2 font-landing-body text-[14px] text-grey-600";

function OutlookCard({ projection, demand }: { projection: ProjectionStat | undefined; demand: DemandStat | undefined }) {
  const points = projectionPoints(projection?.series);
  const growth = projection?.value;
  const Trend = growth != null && growth < 0 ? TrendingDown : TrendingUp;

  return (
    <article className={clsx(innerCard, "border-b-4")} aria-label="Job outlook">
      <div className="grid gap-6 sm:grid-cols-2 sm:divide-x sm:divide-grey-100">
        <div className="sm:pr-6">
          {projection && <Geo name={projection.geography} />}
          <p className="mt-4 font-landing-body text-[15px] text-grey-600">{CAREER_PROFILE.growthLabel}</p>
          {growth != null ? (
            <p className="mt-1 flex items-center gap-1.5 font-landing-body text-2xl text-ink">
              <Trend aria-hidden className={clsx("size-5", growth < 0 ? "text-danger-600" : "text-success-600")} />
              {growth > 0 ? "+" : ""}
              {Number(growth.toFixed(1))}%
            </p>
          ) : (
            <p className="mt-1 font-landing-body text-2xl text-grey-500">{CAREER_PROFILE.notYet}</p>
          )}
        </div>
        <div className="sm:pl-6">
          {demand && <Geo name={demand.geography} />}
          <p className="mt-4 font-landing-body text-[15px] text-grey-600">{CAREER_PROFILE.demandLabel}</p>
          <p className="mt-1 font-landing-body text-2xl text-ink">{demand?.value ?? CAREER_PROFILE.notYet}</p>
        </div>
      </div>

      {points ? (
        <GrowthChart points={points} unit={projection?.seriesUnit} />
      ) : (
        <div className="mt-6">
          <Unavailable text={CAREER_PROFILE.growthUnavailable} />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-1">
        {projection && <Source stat={projection} />}
        {demand && <Source stat={demand} />}
      </div>
    </article>
  );
}

/**
 * Pay & Job outlook. Salary cards per geography on the left; growth (with the
 * base-to-projected chart) and current demand on the right. Each figure keeps
 * its own geography and source, since the API reports them separately.
 */
export default function OutlookSection({ career }: { career: Career }) {
  const medians = career.stats.filter((s): s is SalaryMedianStat => s.kind === "salary-median");
  const ranges = career.stats.filter((s): s is SalaryRangeStat => s.kind === "salary-range");
  const projection = career.stats.find((s): s is ProjectionStat => s.kind === "employment-projection");
  const demand = career.stats.find((s): s is DemandStat => s.kind === "demand");

  return (
    <section aria-labelledby="outlook-heading" className={panel}>
      <h2 id="outlook-heading" className={panelTitle}>
        {CAREER_PROFILE.outlook}
      </h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-[37%_1fr]">
        <div className="flex flex-col gap-4">
          {medians.length > 0 ? (
            medians.map((median) => (
              <SalaryCard
                key={median.id}
                median={median}
                range={ranges.find((r) => r.id === `${median.id}-range`)}
              />
            ))
          ) : (
            <Unavailable text={CAREER_PROFILE.payUnavailable} />
          )}
        </div>
        <OutlookCard projection={projection} demand={demand} />
      </div>
    </section>
  );
}
