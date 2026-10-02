import type { PayPeriod } from "../../types/career.types";
import type { Statistic } from "../../types/career.types";
import type {
  Career,
  CareerLevel,
  ContentStatus,
} from "../../types/career.types";
import type {
  ApiCareerDetail,
  ApiCareerOutlook,
} from "@/features/careerDetail/career.types";
import { careers } from "../../data/careers.mock";

export function getCareerInfo(careerId: string) {
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

const levelMap: Record<string, CareerLevel> = {
  STUDENT: "university-student",
  RECENT_GRAD: "recent-graduate",
  EARLY_CAREER: "early-career",
};

function numberOrNull(value: string | number | null) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (value === null) return null;
  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return value.trim() && Number.isFinite(parsed) ? parsed : null;
}

function payPeriod(value: string | null): PayPeriod {
  return value === "month" || value === "hour" ? value : "year";
}

function status(value: ApiCareerDetail["status"]): ContentStatus {
  return value.toLowerCase() as ContentStatus;
}

function outlookStats(outlook: ApiCareerOutlook): Statistic[] {
  const stats: Statistic[] = [];
  const median = numberOrNull(outlook.median);
  const percentile25 = numberOrNull(outlook.percentile25);
  const percentile75 = numberOrNull(outlook.percentile75);
  const basis = outlook.grossOrNet?.toLowerCase() ?? "";
  const experienceLevel = outlook.experienceLevel?.toLowerCase() ?? "";
  const meta = {
    id: outlook.id,
    source: outlook.source,
    period: outlook.period,
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
      seriesUnit: "employment",
      meaning: "Projected employment growth",
    });
  }

  if (outlook.type !== "SALARY" && outlook.demandLevel) {
    const demand = outlook.demandLevel.toLowerCase();
    stats.push({
      ...meta,
      id: `${outlook.id}-demand`,
      kind: "demand",
      value: (demand.charAt(0).toUpperCase() + demand.slice(1)) as
        "Low" | "Moderate" | "High" | "Very high",
      meaning: "Current hiring demand",
    });
  }

  return stats;
}

export function toCareer(data: ApiCareerDetail): Career {
  const skills = data.skills.map((skill) => skill.name).join(", ");
  return {
    id: data.id,
    status: status(data.status),
    title: data.title,
    description: data.description,
    levels: data.targetLevels.map((level) => levelMap[level]).filter(Boolean),
    tags: data.skills.map((skill) => skill.name),
    roleSummary: data.roleSummary,
    workActivities: data.exampleActivities,
    entryConsiderations: [
      { label: "Typical education", detail: data.typicalEducationNote },
      ...(skills ? [{ label: "Key skills", detail: skills }] : []),
      ...(data.certificationsNote
        ? [{ label: "Certifications", detail: data.certificationsNote }]
        : []),
    ],
    roadmapId: data.pathway?.id ?? null,
    stats: data.outlook.flatMap(outlookStats),
  };
}
