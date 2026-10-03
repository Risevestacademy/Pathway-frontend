import { Link } from "@tanstack/react-router";
import { ChevronLeft, SearchX } from "lucide-react";
import RoadmapPage from "../../pathway/components/RoadmapPage";
import StateMessage from "../../../components/StateMessage";
import ResourceCard from "./ResourceCard";
import type { RoadmapLookup } from "../../pathway/pathway.types";
import type { getStepContext } from "../../pathway/pathway.utils";
import type { Resource } from "../resources.types";

interface ResourcesPageProps {
  careerId: string;
  stepId: string;
  result: RoadmapLookup;
  context: ReturnType<typeof getStepContext>;
  resources: Resource[];
}

export default function ResourcesPage({
  careerId,
  stepId,
  result,
  context,
  resources,
}: ResourcesPageProps) {
  if (!result || !context) {
    return (
      <RoadmapPage>
        <StateMessage
          icon={SearchX}
          title="Resources not found"
          body="This career step may have been moved or removed from the roadmap."
        />
      </RoadmapPage>
    );
  }

  return (
    <RoadmapPage>
      <Link
        to="/careers/$careerId/roadmap/$stepId"
        params={{ careerId, stepId }}
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Back to step
      </Link>

      <p className="text-sm font-medium text-brand-700">{context.step.title}</p>
      <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
        Learning resources
      </h1>
      <p className="mt-2 text-ink-muted">
        Hand-picked for this step. Links open in a new tab, so your roadmap stays right here.
      </p>

      {resources.length > 0 ? (
        <ul className="mt-8 grid gap-4">
          {resources.map((resource) => (
            <li key={resource.id}>
              <ResourceCard
                resource={resource}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 rounded-md border border-dashed border-line-strong p-4 text-center text-sm text-ink-muted">
          Learning resources for this step are coming soon.
        </p>
      )}
    </RoadmapPage>
  );
}