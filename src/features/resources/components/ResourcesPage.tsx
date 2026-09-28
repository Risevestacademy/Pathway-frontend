import { Link } from "@tanstack/react-router";
import { ChevronLeft, SearchX } from "lucide-react";
import RoadmapPage from "../../pathway/components/RoadmapPage";
import StateMessage from "../../../components/StateMessage";
import { getRoadmap, getStepContext } from "../../pathway/pathway.utils";
import ResourceCard from "./ResourceCard";
import { getResources } from "../resources.utils";

interface ResourcesPageProps {
  careerId: string;
  stepId: string;
}

export default function ResourcesPage({
  careerId,
  stepId,
}: ResourcesPageProps) {
  const result = getRoadmap(careerId);
  const context = getStepContext(result?.roadmap?.steps ?? [], stepId);

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

  const resources = getResources(context.step.resourceIds);

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
        <div className="mt-8 grid gap-4">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              careerId={careerId}
              stepId={stepId}
            />
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-md border border-dashed border-line-strong p-4 text-center text-sm text-ink-muted">
          Learning resources for this step are coming soon.
        </p>
      )}
    </RoadmapPage>
  );
}