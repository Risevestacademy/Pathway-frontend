import { Button } from "../../../components/ui/Button";
import { Skeleton } from "../../../components/ui/Skeleton";
import { StateMessage } from "../../../components/ui/StateMessage";
import { BackLinkTo } from "../../skillCheck/components/BackLink";
import { useEarlierPathways } from "../hooks/useEarlierPathways";
import { usePathwayProgress } from "../hooks/usePathwayProgress";
import { ProgressScreen } from "./ProgressScreen";

/** A career's progress, with its own loading, error and empty states. */
export function ProgressPage({ careerId }: { careerId: string }) {
  const { state, retry } = usePathwayProgress(careerId);
  const earlier = useEarlierPathways(careerId);

  if (state.kind === "ready") {
    return (
      <ProgressScreen
        careerId={careerId}
        careerTitle={state.careerTitle}
        overview={state.overview}
        groups={state.groups}
        activation={state.activation}
        earlier={earlier}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <BackLinkTo to="/my-pathway" label="Back" />
      {state.kind === "loading" && (
        <div role="status" className="flex flex-col gap-6">
          <span className="sr-only">Loading your progress</span>
          <Skeleton className="h-56 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      )}
      {state.kind === "error" && (
        <StateMessage
          kind="error"
          title="We couldn’t load your progress"
          body="Your progress is safe. Check your connection and try again."
          action={
            <Button isPrimary={false} onClick={retry}>
              Try again
            </Button>
          }
        />
      )}
      {state.kind === "unavailable" && (
        <StateMessage
          kind="empty"
          title="Roadmap coming soon"
          body="We’re still putting together the roadmap for this career."
        />
      )}
    </div>
  );
}
