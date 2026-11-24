import { createFileRoute } from "@tanstack/react-router";
import { TaskBriefPage } from "../../../../../features/pathwayTasks/TaskBriefPage";

export const Route = createFileRoute("/_protected/my-pathway/$careerId/tasks/$taskId")({
  component: TaskBriefRoute,
});

function TaskBriefRoute() {
  const { careerId, taskId } = Route.useParams();
  return <TaskBriefPage careerId={careerId} taskId={taskId} />;
}
