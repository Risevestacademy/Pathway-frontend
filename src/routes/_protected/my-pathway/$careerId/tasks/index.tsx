import { createFileRoute } from "@tanstack/react-router";
import { TasksPage } from "../../../../../features/pathwayTasks/TasksPage";

export const Route = createFileRoute("/_protected/my-pathway/$careerId/tasks/")({
  component: TasksRoute,
});

function TasksRoute() {
  const { careerId } = Route.useParams();
  return <TasksPage careerId={careerId} />;
}
