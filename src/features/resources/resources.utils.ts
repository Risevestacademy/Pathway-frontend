
import type { PathwayResourceDto, PathwayResourceType } from "../../lib/api/pathways.api";
import type { Resource } from "./resources.types";

const resourceKindMap: Record<PathwayResourceType, Resource["kind"]> = {
 COURSE: "course",
 CERTIFICATION: "certification",
 ARTICLE: "article",
 VIDEO: "video",
 BOOK: "book",
};

export function getResources(
  resourceIds: string[],
  resources: Resource[] = mockResources,
) {
  const resourcesById = new Map(resources.map((resource) => [resource.id, resource]));
  return resourceIds.flatMap((resourceId) => {
    const resource = resourcesById.get(resourceId);
    return resource ? [resource] : [];
  });
}

export function mapPathwayResource(resource: PathwayResourceDto): Resource {
  return {
    id: resource.id,
    title: resource.title,
    provider: resource.provider,
    kind: resourceKindMap[resource.type],
    url: resource.url,
    costLabel:
      resource.costStatus === "UNKNOWN"
        ? "Cost unknown"
        : `Course: ${resource.costStatus.toLowerCase()}`,
    certificationLabel: resource.certificationCost
      ? `Certification: ${resource.certificationCost}`
      : undefined,
  };
}
