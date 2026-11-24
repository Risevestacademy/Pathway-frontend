import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SkillButton } from "./SkillButton";
import { StateMessage } from "../../../components/ui/StateMessage";
import { Skeleton } from "../../../components/ui/Skeleton";
import {
  useSkillAssessment,
  useSkillCheckCareers,
  useSkillCheckUserId,
} from "../hooks/useSkillCheck";
import { useResetAssessment } from "../hooks/useSkillCheckActions";
import { readDraft } from "../skillCheck.storage";
import type { SkillAssessment, SkillCheckCareerSummary } from "../skillCheck.types";
import { ActiveCareerCard } from "./ActiveCareerCard";
import { CareerPickerDialog } from "./CareerPickerDialog";
import { ChooseCareerPanel } from "./ChooseCareerPanel";
import { HowItWorksCard } from "./HowItWorksCard";
import { HowItWorksDialog } from "./HowItWorksDialog";
import { OtherCareersCard } from "./OtherCareersCard";
import { PageHeading } from "./PageHeading";
import { BackLink } from "./BackLink";
import { RetakeDialog } from "./RetakeDialog";

const OTHER_CAREERS_SHOWN = 3;

export function SkillCheckHub() {
  const navigate = useNavigate();
  const { careers, isError: careersFailed, refetch: refetchCareers } = useSkillCheckCareers();
  const { state, retry } = useSkillAssessment();
  const [explored, setExplored] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const goToCheck = (careerId: string) =>
    navigate({ to: "/my-pathway/skill-check/$careerId", params: { careerId } });

  const heading = (
    <PageHeading
      title="Skill check"
      description="See your existing skills and career gaps, based on what you share."
    />
  );

  if (careersFailed || state.kind === "error") {
    return (
      <>
        {heading}
        <StateMessage
          kind="error"
          title="We could not load your skill check"
          body="Check your connection and try again."
          action={
            <SkillButton
              onClick={() => {
                void refetchCareers();
                retry();
              }}
            >
              Try again
            </SkillButton>
          }
        />
      </>
    );
  }

  if (!careers || state.kind === "loading") {
    return (
      <>
        {heading}
        <div
          role="status"
          aria-label="Loading your skill check"
          className="grid gap-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,3fr)]"
        >
          <Skeleton className="h-80 rounded-[28px]" />
          <Skeleton className="h-80 rounded-[28px]" />
        </div>
      </>
    );
  }

  const firstReviewed = careers.find((career) => career.reviewed)?.careerId ?? null;
  const exploredId = explored ?? firstReviewed;
  const others = careers.filter((career) => !career.isActive);

  return (
    <>
      {state.kind === "ready" && state.assessment.hasResult && <BackLink fallbackTo="/careers" />}
      {heading}

      {state.kind === "ready" ? (
        <ActivePathwayView
          key={state.assessment.careerId}
          assessment={state.assessment}
          others={others}
          onCheck={(careerId) => void goToCheck(careerId)}
          onChooseAnother={() => setPickerOpen(true)}
        />
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_384px]">
          <ChooseCareerPanel
            careers={careers}
            value={exploredId}
            onChange={setExplored}
            onStart={() => exploredId && void goToCheck(exploredId)}
          />
          <HowItWorksCard />
        </div>
      )}

      <CareerPickerDialog
        open={pickerOpen}
        careers={careers}
        initialCareerId={others.find((career) => career.reviewed)?.careerId ?? null}
        onClose={() => setPickerOpen(false)}
        onConfirm={(careerId) => {
          setPickerOpen(false);
          void goToCheck(careerId);
        }}
      />
    </>
  );
}

function ActivePathwayView({
  assessment,
  others,
  onCheck,
  onChooseAnother,
}: {
  assessment: SkillAssessment;
  others: SkillCheckCareerSummary[];
  onCheck: (careerId: string) => void;
  onChooseAnother: () => void;
}) {
  const userId = useSkillCheckUserId();
  const reset = useResetAssessment(assessment.careerId);
  const [howOpen, setHowOpen] = useState(false);
  const [retakeOpen, setRetakeOpen] = useState(false);
  const draft = readDraft(userId, assessment.careerId)?.answers ?? null;

  const retake = async () => {
    try {
      await reset.mutateAsync();
      setRetakeOpen(false);
      onCheck(assessment.careerId);
    } catch {
      return;
    }
  };

  return (
    <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,3fr)]">
      <ActiveCareerCard
        assessment={assessment}
        draft={draft}
        onStart={() => onCheck(assessment.careerId)}
        onShowHow={() => setHowOpen(true)}
        onRetake={() => {
          reset.reset();
          setRetakeOpen(true);
        }}
      />
      <OtherCareersCard
        careers={others.filter((career) => career.reviewed).slice(0, OTHER_CAREERS_SHOWN)}
        onSelect={(career) => onCheck(career.careerId)}
        onChooseAnother={onChooseAnother}
      />
      <HowItWorksDialog
        open={howOpen}
        careerName={assessment.name}
        onClose={() => setHowOpen(false)}
        onStart={() => onCheck(assessment.careerId)}
      />
      <RetakeDialog
        open={retakeOpen}
        careerName={assessment.name}
        pending={reset.isPending}
        error={reset.isError}
        onCancel={() => setRetakeOpen(false)}
        onConfirm={() => void retake()}
      />
    </div>
  );
}
