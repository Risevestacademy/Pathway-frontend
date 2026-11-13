import { Button } from "../../../components/ui/Button";
import { Skeleton } from "../../../components/ui/Skeleton";
import { StateMessage } from "../../../components/ui/StateMessage";
import { BackLinkTo } from "../../skillCheck/components/BackLink";
import { useResourceDetail } from "../hooks/useResourceDetail";
import { ResourceDetailScreen } from "./ResourceDetailScreen";

/** One resource of a career's pathway, with its own loading, error and empty states. */
export function ResourceDetailPage({
  careerId,
  resourceId,
}: {
  careerId: string;
  resourceId: string;
}) {
  const { state, retry } = useResourceDetail(careerId, resourceId);

  if (state.kind === "ready") {
    return (
      <ResourceDetailScreen careerId={careerId} careerTitle={state.careerTitle} detail={state.detail} />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <BackLinkTo to="/my-pathway/$careerId/resources" params={{ careerId }} label="Back" />
      {state.kind === "loading" && (
        <div role="status" className="flex flex-col gap-6">
          <span className="sr-only">Loading this resource</span>
          <Skeleton className="h-24 w-2/3 rounded-3xl" />
          <Skeleton className="h-72 rounded-3xl" />
        </div>
      )}
      {state.kind === "error" && (
        <StateMessage
          kind="error"
          title="We couldn’t load this resource"
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
      {state.kind === "not-found" && (
        <StateMessage
          kind="empty"
          title="We couldn’t find that resource"
          body="It may have been removed from this roadmap. Go back to see the current resources."
        />
      )}
    </div>
  );
}
