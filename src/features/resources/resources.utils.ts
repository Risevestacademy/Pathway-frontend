import { mockResources } from "./resources.mock";
import type { Resource } from "./resources.types";

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
