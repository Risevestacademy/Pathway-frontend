import type { ApiCareerDetail } from "../careerDetail/career.types";
import type { CareerPathwayDto, PathwayStepDto } from "../../lib/api/pathways.api";
import type { AdminCareerDetailResponse, AdminCareerView } from "./adminCareers.types";

/**
 * GET /admin/careers/{id} works for a career in any status, but its shape
 * differs a little from the public one (an outlook's source is an object, the
 * pathway carries its steps, text can be null). This turns it into the shapes
 * the editor and the career tables already use.
 */
export function toAdminCareerView(raw: AdminCareerDetailResponse): AdminCareerView {
  const steps: PathwayStepDto[] = (raw.pathway?.steps ?? []).map((step) => ({
    id: step.id,
    title: step.title,
    description: step.description ?? "",
    learningObjective: step.learningObjective,
    prerequisites: step.prerequisites ?? null,
    expectedActivity: step.expectedActivity,
    order: step.order,
    skills: step.skills.map(({ id, name }) => ({ id, name })),
    // Withdrawn resources are not shown to learners, so the editor starts without them too.
    resources: step.resources
      .filter((resource) => resource.status !== "WITHDRAWN")
      .map((resource) => ({
        id: resource.id,
        title: resource.title,
        description: null,
        url: resource.url,
        type: resource.type as PathwayStepDto["resources"][number]["type"],
        provider: resource.provider,
        costStatus: resource.costStatus as PathwayStepDto["resources"][number]["costStatus"],
        certificationCost: null,
        curationRationale: "",
        lastCheckedDate: resource.lastCheckedDate,
        skills: [],
      })),
  }));

  const detail: ApiCareerDetail = {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    description: raw.description,
    roleSummary: raw.roleSummary ?? "",
    exampleActivities: raw.exampleActivities,
    typicalEducationNote: raw.typicalEducationNote ?? "",
    certificationsNote: raw.certificationsNote ?? "",
    field: { name: raw.field.name, slug: raw.field.slug },
    targetLevels: raw.targetLevels,
    status: raw.status,
    publishedAt: raw.publishedAt,
    updatedAt: raw.updatedAt,
    skills: raw.skills.map(({ id, name }) => ({ id, name })),
    outlook: raw.outlook.map(({ source, ...outlook }) => ({
      ...outlook,
      source: source?.name ?? "",
      sourceUrl: source?.url ?? null,
    })),
    pathway: raw.pathway
      ? { id: raw.pathway.id, title: raw.pathway.title, stepCount: steps.length }
      : null,
  };

  const pathway: CareerPathwayDto["pathway"] | null = raw.pathway
    ? {
        id: raw.pathway.id,
        careerId: raw.id,
        title: raw.pathway.title,
        description: raw.pathway.description,
        steps,
      }
    : null;

  return { detail, pathway, version: raw.version };
}
