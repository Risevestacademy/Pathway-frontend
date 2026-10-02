import type {
  ApiTargetLevel,
  CareerField,
} from "@/features/catalog/catalog.types";

export interface ApiCareerOutlook {
  id: string;
  type: string;
  geography: string;
  source: string;
  sourceUrl: string | null;
  period: string;
  median: string | null;
  percentile25: string | null;
  percentile75: string | null;
  currency: string | null;
  payPeriod: string | null;
  grossOrNet: string | null;
  experienceLevel: string | null;
  baseYear: number | null;
  baseValue: number | null;
  projectedYear: number | null;
  projectedValue: number | null;
  growthPercent: string | null;
  demandLevel: string | null;
  updatedAt: string;
}

export interface ApiCareerDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  roleSummary: string;
  exampleActivities: string[];
  typicalEducationNote: string;
  certificationsNote: string;
  field: Pick<CareerField, "name" | "slug">;
  targetLevels: ApiTargetLevel[];
  status: "DRAFT" | "PUBLISHED" | "RETIRED";
  publishedAt: string | null;
  updatedAt: string;
  skills: { id: string; name: string }[];
  outlook: ApiCareerOutlook[];
  pathway: { id: string; title: string; stepCount: number } | null;
}

export interface FetchCareersParams {
  level?: ApiTargetLevel;
  /** Field slug, e.g. "software-engineering". */
  interest?: string;
}
