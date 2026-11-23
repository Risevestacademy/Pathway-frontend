import { createFileRoute } from "@tanstack/react-router";
import { StageQuizPage } from "../../../../../../features/stageQuiz/StageQuizPage";

export const Route = createFileRoute("/_protected/my-pathway/$careerId/quiz/$stageId/")({
  component: StageQuizRoute,
});

function StageQuizRoute() {
  const { careerId, stageId } = Route.useParams();
  return <StageQuizPage careerId={careerId} stageId={stageId} />;
}
