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

/** One outlook figure as GET /careers/{id} returns it. Names its source by id only. */
export interface PublicCareerOutlookDto {
  id: string;
  type: "SALARY" | "EMPLOYMENT_GROWTH" | "DEMAND" | (string & {});
  geography: string;
  sourceId: string | null;
  period?: string | null;
  median?: string | null;
  percentile25?: string | null;
  percentile75?: string | null;
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
}

export interface PublicCareerResourceDto {
  id: string;
  title: string;
  provider: string;
  url: string;
  costStatus: "FREE" | "PAID" | "UNKNOWN";
  estimatedWeeks: number | null;
  badgeImageUrl: string | null;
}

/**
 * GET /careers/{id}: a published career, for the public pages. Unlike the admin
 * detail it doesn't repeat the career's id, slug, levels, field or pathway.
 */
export interface PublicCareerDetailDto {
  overview: {
    title: string;
    description: string;
    roleSummary: string | null;
    exampleActivities: string[];
    imageUrl: string | null;
    skills: { id: string; name: string; importance: "REQUIRED" | "NICE_TO_HAVE" }[];
    /** Steps in the career's pathway. Zero when it has no roadmap yet. */
    topicCount: number;
    resourceCount: number;
  };
  projection: PublicCareerOutlookDto[];
  requirements: {
    courses: PublicCareerResourceDto[];
    certifications: PublicCareerResourceDto[];
  };
}

export interface FetchCareersParams {
  level?: ApiTargetLevel;
  /** Field slug, e.g. "software-engineering". */
  interest?: string;
}
