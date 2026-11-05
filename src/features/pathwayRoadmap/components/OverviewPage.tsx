import { Button } from "../../../components/ui/Button";
import { Skeleton } from "../../../components/ui/Skeleton";
import { StateMessage } from "../../../components/ui/StateMessage";
import { BackLink } from "../../skillCheck/components/BackLink";
import { usePathwayOverview } from "../hooks/usePathwayOverview";
import { OverviewScreen } from "./OverviewScreen";

/** A career's pathway overview, with its own loading, error and empty states. */
export function OverviewPage({ careerId }: { careerId: string }) {
  const { state, retry } = usePathwayOverview(careerId);

  if (state.kind === "ready") {
    return (
      <OverviewScreen careerId={careerId} careerTitle={state.careerTitle} overview={state.overview} />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <BackLink fallbackTo="/my-pathway" />
      {state.kind === "loading" && (
        <div role="status" className="flex flex-col gap-6">
          <span className="sr-only">Loading your roadmap</span>
          <Skeleton className="h-56 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      )}
      {state.kind === "error" && (
        <StateMessage
          kind="error"
          title="We couldn’t load this roadmap"
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
