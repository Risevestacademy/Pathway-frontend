import type { ResourceCompletionResponseDto } from "../../lib/api/pathways.api";
import type {
  PathwayResourceItemDto,
  PathwayResourcesDto,
} from "../../lib/api/pathwayResources.api";

function everyResource(data: PathwayResourcesDto): PathwayResourceItemDto[] {
  return [
    ...data.stages.flatMap((stage) => stage.steps.flatMap((step) => step.resources)),
    ...data.optionalPaidCourses,
  ];
}

/** The ids of the resources the caller has completed, whichever step lists them. */
export function completedResourceIds(
  data: PathwayResourcesDto | null | undefined,
): Set<string> {
  if (!data) return new Set();
  return new Set(
    everyResource(data)
      .filter((resource) => resource.isCompleted)
      .map((resource) => resource.id),
  );
}

/**
 * Folds a confirmed save into the resources read. Completion is per user and
 * shared across steps, so every place the resource appears changes.
 */
export function applyResourceCompletion(
  data: PathwayResourcesDto,
  response: ResourceCompletionResponseDto,
): PathwayResourcesDto;
export function applyResourceCompletion(
  data: PathwayResourcesDto | undefined,
  response: ResourceCompletionResponseDto,
): PathwayResourcesDto | undefined;
export function applyResourceCompletion(
  data: PathwayResourcesDto | undefined,
  response: ResourceCompletionResponseDto,
): PathwayResourcesDto | undefined {
  if (!data) return data;

  const update = (resource: PathwayResourceItemDto): PathwayResourceItemDto =>
    resource.id === response.resourceId
      ? { ...resource, isCompleted: response.completed, completedAt: response.completedAt }
      : resource;

  return {
    ...data,
    stages: data.stages.map((stage) => ({
      ...stage,
      steps: stage.steps.map((step) => ({ ...step, resources: step.resources.map(update) })),
    })),
    optionalPaidCourses: data.optionalPaidCourses.map(update),
  };
}
