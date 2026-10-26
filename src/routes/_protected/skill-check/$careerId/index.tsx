import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "../../../../components/ui/Button";
import { StateMessage } from "../../../../components/ui/StateMessage";
import { BackLink } from "../../../../features/skillCheck/components/BackLink";
import { Questionnaire } from "../../../../features/skillCheck/components/Questionnaire";
import { UnavailableCareer } from "../../../../features/skillCheck/components/UnavailableCareer";
import { useSkillCheckCareer } from "../../../../features/skillCheck/hooks/useSkillCheck";
import { useStartSkillCheck } from "../../../../features/skillCheck/hooks/useSkillCheckActions";

export const Route = createFileRoute("/_protected/skill-check/$careerId/")({
  component: QuestionnairePage,
});

function QuestionnairePage() {
  const { careerId } = Route.useParams();
  const careerQuery = useSkillCheckCareer(careerId);
  const career = careerQuery.data;
  const { mutate: start, data: record, isError, reset } = useStartSkillCheck();
  const ready = Boolean(career && career.reviewed);

  useEffect(() => {
    if (ready) start(careerId);
  }, [ready, careerId, start]);

  if (careerQuery.isError || isError) {
    return (
      <>
        <BackLink />
        <StateMessage
          kind="error"
          title="We could not open this skill check"
          body="Your saved answers are safe. Check your connection and try again."
          action={
            <Button
              onClick={() => {
                reset();
                if (careerQuery.isError) void careerQuery.refetch();
                else start(careerId);
              }}
            >
              Try again
            </Button>
          }
        />
      </>
    );
  }

  if (career === null) {
    return (
      <>
        <BackLink />
        <StateMessage
          kind="empty"
          title="We could not find that career"
          body="It may have been removed. Choose another career from Skill check."
        />
      </>
    );
  }

  if (career && !career.reviewed) return <UnavailableCareer career={career} />;

  if (!career || !record) {
    return <StateMessage kind="loading" title="Loading your skill check" />;
  }

  return <Questionnaire key={careerId} career={career} record={record} />;
}
