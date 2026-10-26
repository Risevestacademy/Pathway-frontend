import { Navigate, createFileRoute } from "@tanstack/react-router";
import { StateMessage } from "../../../../components/ui/StateMessage";
import { BackLink } from "../../../../features/skillCheck/components/BackLink";
import { RoadmapPreview } from "../../../../features/skillCheck/components/RoadmapPreview";
import { SkillButton } from "../../../../features/skillCheck/components/SkillButton";
import {
  useSkillCheckCareer,
  useSkillCheckRecord,
} from "../../../../features/skillCheck/hooks/useSkillCheck";

export const Route = createFileRoute("/_protected/skill-check/$careerId/roadmap")({
  component: RoadmapPage,
});

function RoadmapPage() {
  const { careerId } = Route.useParams();
  const careerQuery = useSkillCheckCareer(careerId);
  const recordQuery = useSkillCheckRecord(careerId);

  if (careerQuery.isError || recordQuery.isError) {
    return (
      <>
        <BackLink />
        <StateMessage
          kind="error"
          title="We could not load your roadmap"
          body="Your progress is safe. Check your connection and try again."
          action={
            <SkillButton
              onClick={() => {
                void careerQuery.refetch();
                void recordQuery.refetch();
              }}
            >
              Try again
            </SkillButton>
          }
        />
      </>
    );
  }

  if (careerQuery.isPending || recordQuery.isPending) {
    return <StateMessage kind="loading" title="Loading your roadmap" />;
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

  if (!record || !record.startingPoint) {
    return <Navigate to="/skill-check/$careerId" params={{ careerId }} replace />;
  }

  return (
    <>
      <BackLink />
      <RoadmapPreview career={career} record={record} />
    </>
  );
}
