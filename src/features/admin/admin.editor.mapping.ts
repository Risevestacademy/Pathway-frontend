import type { ApiCareerDetail } from "../careerDetail/career.types";
import type { CareerPathwayDto } from "../../lib/api/pathways.api";
import type { AdminCareerRow } from "./admin.utils";
import type {
  EditableCareer,
  ResourceCost,
  ResourceItem,
  ResourceType,
  SourceItem,
} from "./admin.editor.types";

const LEVEL_LABEL: Record<string, string> = {
  STUDENT: "University student",
  RECENT_GRAD: "Recent graduate",
  EARLY_CAREER: "Early career professional",
};

const RESOURCE_TYPE_FROM_API: Record<string, ResourceType> = {
  COURSE: "course",
  CERTIFICATION: "certification",
  ARTICLE: "article",
  VIDEO: "video",
  BOOK: "book",
};

const COST_FROM_API: Record<string, ResourceCost> = {
  FREE: "free",
  PAID: "paid",
  UNKNOWN: "unknown",
};

function formatSalary(outlook: ApiCareerDetail["outlook"]): string {
  const o = outlook.find((x) => x.median || x.percentile25 || x.percentile75);
  if (!o) return "";
  const cur = o.currency ? `${o.currency} ` : "";
  if (o.percentile25 && o.percentile75) return `${cur}${o.percentile25} - ${o.percentile75}`;
  return `${cur}${o.median ?? ""}`.trim();
}

function seedSources(outlook: ApiCareerDetail["outlook"]): SourceItem[] {
  const seen = new Set<string>();
  const sources: SourceItem[] = [];
  for (const o of outlook) {
    if (seen.has(o.source)) continue;
    seen.add(o.source);
    sources.push({
      id: o.id,
      title: o.source,
      link: o.sourceUrl ?? "",
      usedFor: o.demandLevel ? "Demand outlook" : "Salary range",
      type: o.demandLevel ? "Report" : "Salary survey",
      lastChecked: o.updatedAt,
    });
  }
  return sources;
}

type Pathway = CareerPathwayDto["pathway"] | null | undefined;

/** Starting point for the editor, built from the public career and pathway APIs. */
export function seedFromDetail(detail: ApiCareerDetail, pathway?: Pathway): EditableCareer {
  const steps = [...(pathway?.steps ?? [])].sort((a, b) => a.order - b.order);
  const salaryOutlook = detail.outlook.find((x) => x.median || x.percentile25 || x.percentile75);

  const resources = new Map<string, ResourceItem>();
  for (const step of steps) {
    for (const r of step.resources) {
      const existing = resources.get(r.id);
      if (existing) {
        existing.topicIds.push(step.id);
        continue;
      }
      resources.set(r.id, {
        id: r.id,
        title: r.title,
        url: r.url,
        description: r.description ?? "",
        type: RESOURCE_TYPE_FROM_API[r.type] ?? "article",
        cost: COST_FROM_API[r.costStatus] ?? "unknown",
        topicIds: [step.id],
        // The API only says when a link was last checked, not whether it passed.
        linkStatus: r.lastCheckedDate ? "working" : "not-checked",
        lastChecked: r.lastCheckedDate ?? null,
      });
    }
  }

  return {
    details: {
      name: detail.title,
      summary: detail.description,
      whoItSuits: detail.targetLevels.map((l) => LEVEL_LABEL[l] ?? l).join(", "),
      category: detail.field.name,
      salary: formatSalary(detail.outlook),
      salarySource: salaryOutlook
        ? [salaryOutlook.source, salaryOutlook.sourceUrl].filter(Boolean).join(" · ")
        : "",
      demandOutlook: detail.outlook.find((x) => x.demandLevel)?.demandLevel ?? "",
    },
    // The API doesn't expose importance or per-skill sources yet.
    skills: detail.skills.map((s) => ({
      id: s.id,
      name: s.name,
      description: "",
      importance: "required",
      topicIds: steps.filter((st) => st.skills.some((k) => k.id === s.id)).map((st) => st.id),
      source: "",
      updatedAt: detail.updatedAt,
    })),
    // The API has no stages, so every topic starts in one stage.
    stages: steps.length
      ? [
          {
            id: "stage-1",
            title: "Roadmap",
            topics: steps.map((st) => ({
              id: st.id,
              title: st.title,
              skillId: st.skills[0]?.id ?? null,
            })),
          },
        ]
      : [],
    resources: [...resources.values()],
    sources: seedSources(detail.outlook),
  };
}

/** Starting point for careers created locally. */
export function seedFromRow(row: AdminCareerRow): EditableCareer {
  return {
    details: {
      name: row.title,
      summary: row.shortDescription,
      whoItSuits: "",
      category: "",
      salary: "",
      salarySource: "",
      demandOutlook: "",
    },
    skills: [],
    stages: [],
    resources: [],
    sources: [],
  };
}

/** Fills sections that older saved drafts don't have. */
export function normalizeDraft(d: Partial<EditableCareer> & Pick<EditableCareer, "details">): EditableCareer {
  return {
    details: d.details,
    skills: (d.skills ?? []).map((s) => ({ ...s, topicIds: s.topicIds ?? [] })),
    stages: d.stages ?? [],
    resources: d.resources ?? [],
    sources: d.sources ?? [],
  };
}
