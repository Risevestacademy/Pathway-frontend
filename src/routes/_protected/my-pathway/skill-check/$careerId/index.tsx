import { createFileRoute } from "@tanstack/react-router";
import { Button } from "../../../../../components/ui/Button";
import { StateMessage } from "../../../../../components/ui/StateMessage";
import { BackLink } from "../../../../../features/skillCheck/components/BackLink";
import { Questionnaire } from "../../../../../features/skillCheck/components/Questionnaire";
import { SwitchPathwayGate } from "../../../../../features/skillCheck/components/SwitchPathwayGate";
import { UnavailableCareer } from "../../../../../features/skillCheck/components/UnavailableCareer";
import {
  useSkillAssessment,
  useSkillCheckCareers,
} from "../../../../../features/skillCheck/hooks/useSkillCheck";

export const Route = createFileRoute("/_protected/my-pathway/skill-check/$careerId/")({
  component: QuestionnairePage,
});

function QuestionnairePage() {
  const { careerId } = Route.useParams();
  const { state, retry } = useSkillAssessment();
  const { careers, isError: careersFailed, refetch: refetchCareers } = useSkillCheckCareers();

  if (state.kind === "error" || careersFailed) {
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
                retry();
                void refetchCareers();
              }}
            >
              Try again
            </Button>
          }
        />
      </>
    );
  }

  if (state.kind === "ready" && state.assessment.careerId === careerId) {
    const { assessment } = state;
    if (assessment.skills.length === 0) {
      return (
        <UnavailableCareer
          careerId={assessment.careerId}
          name={assessment.name}
          icon={assessment.icon}
          isActive
        />
      );
    }
    return <Questionnaire key={careerId} assessment={state.assessment} />;
  }

  if (state.kind === "loading" || !careers) {
    return <StateMessage kind="loading" title="Loading your skill check" />;
  }

  const career = careers.find((item) => item.careerId === careerId);
  if (!career) {
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

  // Check the roadmap has skills before offering to switch to it.
  if (!career.reviewed) {
    return (
      <UnavailableCareer
        careerId={career.careerId}
        name={career.name}
        icon={career.icon}
        isActive={false}
      />
    );
  }

  return (
    <SwitchPathwayGate
      career={career}
      currentName={state.kind === "ready" ? state.assessment.name : null}
    />
  );
}
