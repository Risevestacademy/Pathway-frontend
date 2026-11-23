import { createFileRoute } from "@tanstack/react-router";
import { QuizResultPage } from "../../../../../../features/stageQuiz/QuizResultPage";

export const Route = createFileRoute("/_protected/my-pathway/$careerId/quiz/$stageId/result")({
  component: QuizResultRoute,
});

function QuizResultRoute() {
  const { careerId, stageId } = Route.useParams();
  return <QuizResultPage careerId={careerId} stageId={stageId} />;
}
