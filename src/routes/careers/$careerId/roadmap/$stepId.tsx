import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ClipboardCheck,
  ListChecks,
  Lock,
  SearchX,
  Target,
} from "lucide-react";
import { Button } from "../../../../components/Button";
import RoadmapPage from "../../../../features/pathway/components/RoadmapPage";
import StateMessage from "../../../../features/pathway/components/StateMessage";
import StepEstimate from "../../../../features/pathway/components/StepEstimate";
import StepSection from "../../../../features/pathway/components/StepSection";
import {
  getRoadmap,
  getStepContext,
} from "../../../../features/pathway/pathway.utils";

export const Route = createFileRoute("/careers/$careerId/roadmap/$stepId")({
  loader: ({ params }) => {
    const result = getRoadmap(params.careerId);
    const steps = result?.roadmap?.steps ?? [];
    return {
      totalSteps: steps.length,
      context: getStepContext(steps, params.stepId),
    };
  },
  component: StepRoute,
});

function StepRoute() {
  const { careerId } = Route.useParams();
  const { totalSteps, context } = Route.useLoaderData();
  const navigate = useNavigate();

  if (!context) {
    return (
      <RoadmapPage>
        <StateMessage
          icon={SearchX}
          title="Step not found"
          body="This step may have been moved or removed from the roadmap."
          action={
            <Button
              isPrimary={false}
              onClick={() =>
                navigate({
                  to: "/careers/$careerId/roadmap",
                  params: { careerId },
                })
              }
            >
              Back to roadmap
            </Button>
          }
        />
      </RoadmapPage>
    );
  }

  const { step, number, previous, next, required } = context;

  return (
    <RoadmapPage>
      <Link
        to="/careers/$careerId/roadmap"
        params={{ careerId }}
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Roadmap
      </Link>

      <p className="text-sm font-medium text-brand-700">
        Step {number} of {totalSteps}
      </p>
      <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
        {step.title}
      </h1>

      {required && (
        <div
          className="
            mt-6 flex gap-3 rounded-md
            border border-warning-600/30 bg-warning-50 p-4
            text-sm text-ink
          "
        >
          <Lock className="mt-0.5 size-4 shrink-0 text-warning-700" aria-hidden />
          <p>
            <span className="font-semibold">
              Complete step {required.number} first.
            </span>{" "}
            This step builds directly on{" "}
            <Link
              to="/careers/$careerId/roadmap/$stepId"
              params={{ careerId, stepId: required.step.stepId }}
              className="font-medium text-brand-700 underline"
            >
              {required.step.title}
            </Link>
            . You can still read ahead.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-4">
        <StepSection icon={Target} title="What you'll be able to do">
          {step.learningObjective}
        </StepSection>

        {step.prerequisites.length > 0 && (
          <StepSection icon={ListChecks} title="Before you start">
            <ul className="list-disc space-y-1 pl-5">
              {step.prerequisites.map((prerequisite) => (
                <li key={prerequisite}>{prerequisite}</li>
              ))}
            </ul>
          </StepSection>
        )}

        <StepSection icon={ClipboardCheck} title="How you'll show it">
          {step.expectedEvidence}
        </StepSection>

        <StepEstimate estimate={step.estimate} />
      </div>

      <div className="mt-8">
        {step.resourceIds.length > 0 ? (
          //TODO: Change to the step resources route (FR-04) when it exists
          <a
            href="#"
            className="
              flex w-full items-center justify-center gap-2
              rounded px-4 py-3
              bg-brand-500 font-sans text-sm font-semibold text-canvas
              inset-shadow-primary-btn
              transition-[box-shadow,transform] duration-100
              active:translate-y-[2px] active:inset-shadow-primary-btn-pressed
            "
          >
            <BookOpen className="size-5" aria-hidden />
            View resources ({step.resourceIds.length})
          </a>
        ) : (
          <p
            className="
              rounded-md border border-dashed border-line-strong p-4
              text-center text-sm text-ink-muted
            "
          >
            Learning resources for this step are coming soon.
          </p>
        )}
      </div>

      <nav
        aria-label="Step navigation"
        className="mt-8 flex justify-between gap-4 border-t border-line pt-5 text-sm"
      >
        {previous ? (
          <Link
            to="/careers/$careerId/roadmap/$stepId"
            params={{ careerId, stepId: previous.stepId }}
            className="flex items-center gap-2 text-ink-muted hover:text-ink"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">{previous.title}</span>
            <span className="sm:hidden">Previous</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            to="/careers/$careerId/roadmap/$stepId"
            params={{ careerId, stepId: next.stepId }}
            className="flex items-center gap-2 text-right font-medium text-brand-700"
          >
            <span className="hidden sm:inline">{next.title}</span>
            <span className="sm:hidden">Next step</span>
            <ArrowRight className="size-4 shrink-0" aria-hidden />
          </Link>
        )}
      </nav>
    </RoadmapPage>
  );
}
