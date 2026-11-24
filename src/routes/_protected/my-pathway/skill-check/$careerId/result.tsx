import { Navigate, createFileRoute } from "@tanstack/react-router";
import { Button } from "../../../../../components/ui/Button";
import { StateMessage } from "../../../../../components/ui/StateMessage";
import { BackLink } from "../../../../../features/skillCheck/components/BackLink";
import { ResultView } from "../../../../../features/skillCheck/components/ResultView";
import { useSkillAssessment } from "../../../../../features/skillCheck/hooks/useSkillCheck";

export const Route = createFileRoute("/_protected/my-pathway/skill-check/$careerId/result")({
  component: ResultPage,
});

function ResultPage() {
  const { careerId } = Route.useParams();
  const { state, retry } = useSkillAssessment();

  if (state.kind === "error") {
    return (
      <>
        <BackLink />
        <StateMessage
          kind="error"
          title="We could not load your result"
          body="Your answers are safe. Check your connection and try again."
          action={<Button onClick={retry}>Try again</Button>}
        />
      </>
    );
  }

  if (state.kind === "loading") {
    return <StateMessage kind="loading" title="Loading your result" />;
  }

  // Results belong to the active pathway. Anything else goes to the
  // questionnaire, which offers the switch or the first check.
  if (
    state.kind === "no-pathway" ||
    state.assessment.careerId !== careerId ||
    !state.assessment.hasResult
  ) {
    return <Navigate to="/my-pathway/skill-check/$careerId" params={{ careerId }} replace />;
  }

  return <ResultView assessment={state.assessment} />;
}
