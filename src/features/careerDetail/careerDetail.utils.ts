import type {
  Career,
  DemandStat,
  PayPeriod,
  Statistic,
} from "../../types/career.types";
import type {
  PublicCareerDetailDto,
  PublicCareerOutlookDto,
} from "@/features/careerDetail/career.types";

export function getCareerInfo(careerId: string, careers: Career[]) {
  return (
    careers.find((c) => c.id === careerId && c.status === "published") ?? null
  );
}

export function groupByGeo(items: Statistic[]) {
  const byGeo = new Map<string, typeof items>();
  for (const item of items) {
    const list = byGeo.get(item.geography) ?? [];
    list.push(item);
    byGeo.set(item.geography, list);
  }
  return byGeo;
}

export function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export const payPeriodLabel: Record<PayPeriod, string> = {
  year: "per year",
  month: "per month",
  hour: "per hour",
};

function numberOrNull(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (value === null || value === undefined) return null;
  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return value.trim() && Number.isFinite(parsed) ? parsed : null;
}

function payPeriod(value: string | null): PayPeriod {
  return value === "month" || value === "hour" ? value : "year";
}

const DEMAND_LABEL: Record<string, NonNullable<DemandStat["value"]>> = {
  LOW: "Low",
  MEDIUM: "Moderate",
  MODERATE: "Moderate",
  HIGH: "High",
  VERY_HIGH: "Very high",
};

function outlookStats(outlook: PublicCareerOutlookDto): Statistic[] {
  const stats: Statistic[] = [];
  const median = numberOrNull(outlook.median);
  const percentile25 = numberOrNull(outlook.percentile25);
  const percentile75 = numberOrNull(outlook.percentile75);
  const basis = outlook.grossOrNet?.toLowerCase() ?? "";
  const experienceLevel = outlook.experienceLevel?.toLowerCase() ?? "";
  const meta = {
    id: outlook.id,
    // The public API names the source by id only, and an id means nothing to a reader.
    source: "",
    period: outlook.period ?? "",
    geography: outlook.geography,
    meaning:
      outlook.type === "SALARY" ? "Salary information" : "Career outlook",
  };

  if (outlook.type === "SALARY" && outlook.currency) {
    stats.push({
      ...meta,
      kind: "salary-median",
      value: median,
      currency: outlook.currency,
      payPeriod: payPeriod(outlook.payPeriod),
      basis: basis === "gross" || basis === "net" ? basis : "unspecified",
      ...(experienceLevel
        ? {
            experienceLevel: experienceLevel as
              "entry-level" | "mid-career" | "senior",
          }
        : {}),
    });
    if (percentile25 !== null || percentile75 !== null) {
      stats.push({
        ...meta,
        id: `${outlook.id}-range`,
        kind: "salary-range",
        currency: outlook.currency,
        payPeriod: payPeriod(outlook.payPeriod),
        basis: basis === "gross" || basis === "net" ? basis : "unspecified",
        low: { label: "25th percentile", value: percentile25 },
        high: { label: "75th percentile", value: percentile75 },
        ...(experienceLevel
          ? {
              experienceLevel: experienceLevel as
                "entry-level" | "mid-career" | "senior",
            }
          : {}),
      });
    }
  }

  if (outlook.baseValue || outlook.projectedValue || outlook.growthPercent) {
    let series: { label: string; value: number }[] | undefined;
    if (
      outlook.baseYear !== null &&
      outlook.baseValue !== null &&
      outlook.projectedYear !== null &&
      outlook.projectedValue !== null
    ) {
      series = [
        { label: String(outlook.baseYear), value: outlook.baseValue },
        {
          label: `${outlook.projectedYear} (projected)`,
          value: outlook.projectedValue,
        },
      ];
    }
    stats.push({
      ...meta,
      id: `${outlook.id}-projection`,
      kind: "employment-projection",
      value: numberOrNull(outlook.growthPercent),
      series,
      // The API sends no unit; BLS publishes employment projections in
      // thousands. Swap for an API-provided unit once backend adds one.
      seriesUnit: "thousand jobs",
      meaning: "Projected employment growth",
    });
  }

  const demand = outlook.demandLevel
    ? DEMAND_LABEL[outlook.demandLevel.toUpperCase()]
    : undefined;
  if (outlook.type !== "SALARY" && demand) {
    stats.push({
      ...meta,
      id: `${outlook.id}-demand`,
      kind: "demand",
      value: demand,
      meaning: "Current hiring demand",
    });
  }

  return stats;
}

/** "Source, 2025", leaving out whichever the API didn't give. */
export function describeSource(stat: Pick<Statistic, "source" | "period">): string {
  return [stat.source, stat.period].filter(Boolean).join(", ");
}

const titles = (items: { title: string }[]) =>
  items.map((item) => item.title).join(", ");

/**
 * GET /careers/{id} as the pages use it. The response doesn't repeat the career's
 * id, so it comes from the request. It names no pathway either: a career has a
 * roadmap when it has steps, and its roadmap is fetched by the career's id.
 */
export function toCareer(data: PublicCareerDetailDto, careerId: string): Career {
  const { overview, requirements } = data;
  const required = overview.skills.filter((skill) => skill.importance === "REQUIRED");
  const keySkills = titles((required.length ? required : overview.skills).map((s) => ({ title: s.name })));
  const hasRoadmap = overview.topicCount > 0;

  return {
    id: careerId,
    // Only published careers are served here.
    status: "published",
    title: overview.title,
    description: overview.description,
    // Not in this response. The catalogue's cards carry the levels.
    levels: [],
    tags: overview.skills.map((skill) => skill.name),
    roleSummary: overview.roleSummary ?? "",
    workActivities: overview.exampleActivities,
    entryConsiderations: [
      ...(keySkills ? [{ label: "Key skills", detail: keySkills }] : []),
      ...(requirements.courses.length
        ? [{ label: "Courses", detail: titles(requirements.courses) }]
        : []),
      ...(requirements.certifications.length
        ? [{ label: "Certifications", detail: titles(requirements.certifications) }]
        : []),
    ],
    roadmapId: hasRoadmap ? careerId : null,
    roadmapStepCount: hasRoadmap ? overview.topicCount : null,
    field: null,
    stats: data.projection.flatMap(outlookStats),
  };
}
