import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { StateMessage } from "../../components/ui/StateMessage";
import { BackLinkTo } from "../skillCheck/components/BackLink";
import { TasksScreen } from "./TasksScreen";
import { usePathwayTasks } from "./usePathwayTasks";

/** A career's practice tasks, with their own loading, error and empty states. */
export function TasksPage({ careerId }: { careerId: string }) {
  const { state, retry } = usePathwayTasks(careerId);

  if (state.kind === "ready") {
    return (
      <TasksScreen
        careerId={careerId}
        careerTitle={state.careerTitle}
        stepCount={state.stepCount}
        pathwayId={state.pathwayId}
        sections={state.sections}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <BackLinkTo to="/my-pathway" label="Back" />
      {state.kind === "loading" && (
        <div role="status" className="flex flex-col gap-6">
          <span className="sr-only">Loading the practice tasks</span>
          <Skeleton className="h-56 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      )}
      {state.kind === "error" && (
        <StateMessage
          kind="error"
          title="We couldn’t load the practice tasks"
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
