import { CircleSlash, Info, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import type {
  DemandStat,
  ProjectionStat,
  SalaryMedianStat,
  SalaryRangeStat,
  StatMeta,
  Statistic,
} from "../careerDetail.types";
import { formatMoney, payPeriodLabel } from "../careerDetail.utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function StatCard({ stat }: { stat: Statistic }) {
  switch (stat.kind) {
    case "salary-median":
      return <MedianCard stat={stat} />;
    case "salary-range":
      return <RangeCard stat={stat} />;
    case "employment-projection":
      return <ProjectionCard stat={stat} />;
    case "demand":
      return <DemandCard stat={stat} />;
  }
}

function Shell({
  meta,
  children,
  tags,
}: {
  meta: StatMeta;
  children: ReactNode;
  tags?: ReactNode;
}) {
  return (
    <Card className="flex flex-col p-4 md:p-5">
      <p className="text-sm font-medium text-ink-muted">{meta.meaning}</p>
      <div className="mt-2 flex-1">{children}</div>
      {tags && <div className="mt-3 flex flex-wrap gap-1.5">{tags}</div>}
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 border-t border-line pt-3 text-xs">
        <dt className="text-ink-subtle">Source</dt>
        <dd className="text-ink-muted">{meta.source}</dd>
        <dt className="text-ink-subtle">Period</dt>
        <dd className="text-ink-muted">{meta.period}</dd>
        <dt className="text-ink-subtle">Location</dt>
        <dd className="text-ink-muted">{meta.geography}</dd>
      </dl>
    </Card>
  );
}

export function Unavailable({ what = "value" }: { what?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm bg-unavailable-bg px-2 py-1 text-sm font-medium text-unavailable-ink">
      <CircleSlash className="size-4" aria-hidden />
      Unavailable
      <span className="sr-only">— the source does not provide this {what}</span>
    </span>
  );
}

function SalaryTags({ stat }: { stat: SalaryMedianStat | SalaryRangeStat }) {
  return (
    <>
      <Badge>{stat.currency}</Badge>
      <Badge>{payPeriodLabel[stat.payPeriod]}</Badge>
      <Badge>
        {stat.basis === "unspecified"
          ? "Gross/net unspecified"
          : stat.basis === "gross"
            ? "Gross (before tax)"
            : "Net (after tax)"}
      </Badge>
      {stat.experienceLevel && (
        <Badge tone="info">{stat.experienceLevel}</Badge>
      )}
    </>
  );
}

function MedianCard({ stat }: { stat: SalaryMedianStat }) {
  return (
    <Shell meta={stat} tags={<SalaryTags stat={stat} />}>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
        Median
      </p>
      {stat.value == null ? (
        <div className="mt-1">
          <Unavailable what="median salary" />
        </div>
      ) : (
        <p className="font-display text-2xl font-semibold tabular-nums">
          {formatMoney(stat.value, stat.currency)}
          <span className="ml-1 text-sm font-normal text-ink-muted">
            /{stat.payPeriod}
          </span>
        </p>
      )}
    </Shell>
  );
}

function RangeCard({ stat }: { stat: SalaryRangeStat }) {
  const bound = (b: SalaryRangeStat["low"]) => (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
        {b.label}
      </p>
      {b.value == null ? (
        <div className="mt-1">
          <Unavailable what={b.label} />
        </div>
      ) : (
        <p className="font-display text-xl font-semibold tabular-nums">
          {formatMoney(b.value, stat.currency)}
        </p>
      )}
    </div>
  );
  return (
    <Shell meta={stat} tags={<SalaryTags stat={stat} />}>
      <div className="flex items-end gap-3">
        {bound(stat.low)}
        <span className="pb-1 text-ink-subtle" aria-hidden>
          →
        </span>
        {bound(stat.high)}
      </div>
      <p className="mt-1 text-xs text-ink-subtle">
        {payPeriodLabel[stat.payPeriod]}
      </p>
    </Shell>
  );
}

function ProjectionCard({ stat }: { stat: ProjectionStat }) {
  return (
    <Shell meta={stat}>
      {stat.value == null ? (
        <Unavailable what="projection" />
      ) : (
        <p className="flex items-center gap-2 font-display text-2xl font-semibold tabular-nums">
          <TrendingUp className="size-5 text-success-600" aria-hidden />
          {stat.value > 0 ? "+" : ""}
          {stat.value}%
        </p>
      )}
      {stat.series && stat.series.length > 1 && (
        <SeriesBars series={stat.series} unit={stat.seriesUnit} />
      )}
    </Shell>
  );
}

function DemandCard({ stat }: { stat: DemandStat }) {
  return (
    <Shell meta={stat}>
      {stat.value == null ? (
        <Unavailable what="demand indicator" />
      ) : (
        <p className="font-display text-2xl font-semibold">{stat.value}</p>
      )}
    </Shell>
  );
}

/**
 * Only rendered when the source provides the series.
 * One series → no legend; direct labels + a table alternative for screen readers.
 */
function SeriesBars({
  series,
  unit,
}: {
  series: { label: string; value: number }[];
  unit?: string;
}) {
  const max = Math.max(...series.map((p) => p.value));
  return (
    <figure className="mt-4">
      <div className="flex items-end gap-3" aria-hidden>
        {series.map((p) => (
          <div
            key={p.label}
            className="group flex flex-1 flex-col items-center gap-1"
            title={`${p.label}: ${p.value} ${unit ?? ""}`}
          >
            <span className="text-xs font-medium tabular-nums text-ink">
              {p.value}
            </span>
            <div
              className="w-full max-w-16 rounded-t-sm bg-brand-500 group-hover:bg-brand-600"
              style={{ height: `${(p.value / max) * 56}px` }}
            />
            <span className="text-[11px] text-ink-subtle">{p.label}</span>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 flex items-center gap-1 text-[11px] text-ink-subtle">
        <Info className="size-3" /> Source-provided series · {unit}
      </figcaption>
      <table className="sr-only">
        <caption>Employment, {unit}</caption>
        <tbody>
          {series.map((p) => (
            <tr key={p.label}>
              <th>{p.label}</th>
              <td>{p.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
