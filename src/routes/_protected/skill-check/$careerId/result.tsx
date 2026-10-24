import { Navigate, createFileRoute } from "@tanstack/react-router";
import { Button } from "../../../../components/ui/Button";
import { StateMessage } from "../../../../components/ui/StateMessage";
import { BackLink } from "../../../../features/skillCheck/components/BackLink";
import { ResultView } from "../../../../features/skillCheck/components/ResultView";
import {
  useSkillCheckCareer,
  useSkillCheckCareers,
  useSkillCheckRecord,
} from "../../../../features/skillCheck/hooks/useSkillCheck";

export const Route = createFileRoute("/_protected/skill-check/$careerId/result")({
  component: ResultPage,
});

function ResultPage() {
  const { careerId } = Route.useParams();
  const careerQuery = useSkillCheckCareer(careerId);
  const recordQuery = useSkillCheckRecord(careerId);
  const careersQuery = useSkillCheckCareers();

  if (careerQuery.isError || recordQuery.isError || careersQuery.isError) {
    return (
      <>
        <BackLink />
        <StateMessage
          kind="error"
          title="We could not load your result"
          body="Your answers are safe. Check your connection and try again."
          action={
            <Button
              onClick={() => {
                void careerQuery.refetch();
                void recordQuery.refetch();
                void careersQuery.refetch();
              }}
            >
              Try again
            </Button>
          }
        />
      </>
    );
  }

  if (careerQuery.isPending || recordQuery.isPending || careersQuery.isPending) {
    return <StateMessage kind="loading" title="Loading your result" />;
  }

  const career = careerQuery.data;
  const record = recordQuery.data;

  if (!career) {
    return (
      <>
        <BackLink />
        <StateMessage
          kind="empty"
          title="We could not find that career"
          body="Choose another career from Skill check."
        />
      </>
    );
  }

  if (!record || !record.answers) {
    return <Navigate to="/skill-check/$careerId" params={{ careerId }} replace />;
  }

  return <ResultView career={career} record={record} careers={careersQuery.data} />;
}
