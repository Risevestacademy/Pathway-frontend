import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SkillButton } from "./SkillButton";
import { StateMessage } from "../../../components/ui/StateMessage";
import { Skeleton } from "../../../components/ui/Skeleton";
import {
  useSkillCheckCareer,
  useSkillCheckCareers,
  useSkillCheckRecord,
} from "../hooks/useSkillCheck";
import type { SkillCheckCareerSummary } from "../skillCheck.types";
import { ActiveCareerCard } from "./ActiveCareerCard";
import { CareerPickerDialog } from "./CareerPickerDialog";
import { ChooseCareerPanel } from "./ChooseCareerPanel";
import { HowItWorksCard } from "./HowItWorksCard";
import { HowItWorksDialog } from "./HowItWorksDialog";
import { OtherCareersCard } from "./OtherCareersCard";
import { PageHeading } from "./PageHeading";
import { BackLink } from "./BackLink";
import { SkillCheckTabs } from "./SkillCheckTabs";

export function SkillCheckHub() {
  const navigate = useNavigate();
  const careersQuery = useSkillCheckCareers();
  const careers = careersQuery.data;
  const active = careers?.find((career) => career.isActive) ?? null;
  const activeId = active?.careerId ?? "";
  const careerQuery = useSkillCheckCareer(activeId);
  const recordQuery = useSkillCheckRecord(activeId);
  const [howOpen, setHowOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [explored, setExplored] = useState<string | null>(null);

  const open = (career: Pick<SkillCheckCareerSummary, "careerId" | "hasResult">) => {
    void navigate({
      to: career.hasResult
        ? "/skill-check/$careerId/result"
        : "/skill-check/$careerId",
      params: { careerId: career.careerId },
    });
  };

  const goToCheck = (careerId: string) =>
    navigate({ to: "/skill-check/$careerId", params: { careerId } });

  const heading = (
    <PageHeading
      title="Skill check"
      description="See your existing skills and career gaps, based on what you share."
    />
  );

  if (careersQuery.isError) {
    return (
      <>
        {heading}
        <StateMessage
          kind="error"
          title="We could not load your skill check"
          body="Check your connection and try again."
          action={<SkillButton onClick={() => void careersQuery.refetch()}>Try again</SkillButton>}
        />
      </>
    );
  }

  if (!careers || (active && (careerQuery.isPending || recordQuery.isPending))) {
    return (
      <>
        <SkillCheckTabs />
        {heading}
        <div
          role="status"
          aria-label="Loading your skill check"
          className="grid gap-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,3fr)]"
        >
          <Skeleton className="h-80 rounded-3xl" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </>
    );
  }

  if (active && (careerQuery.isError || recordQuery.isError || !careerQuery.data)) {
    return (
      <>
        <SkillCheckTabs />
        {heading}
        <StateMessage
          kind="error"
          title="We could not load your skill check"
          body="Check your connection and try again."
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

  const showsResult = Boolean(active && recordQuery.data?.completedAt);
  const others = careers.filter((career) => !career.isActive);
  const firstReviewed = careers.find((career) => career.reviewed)?.careerId ?? null;
  const exploredId = explored ?? firstReviewed;

  return (
    <>
      {showsResult ? <BackLink fallbackTo="/careers" /> : <SkillCheckTabs />}
      {heading}

      <div
        className={
          active && careerQuery.data
            ? "grid items-start gap-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,3fr)]"
            : "grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_384px]"
        }
      >
        {active && careerQuery.data ? (
          <>
            <ActiveCareerCard
              summary={active}
              career={careerQuery.data}
              record={recordQuery.data ?? null}
              onStart={() => void goToCheck(active.careerId)}
              onShowHow={() => setHowOpen(true)}
            />
            <OtherCareersCard
              careers={others}
              onSelect={open}
              onChooseAnother={() => setPickerOpen(true)}
            />
            <HowItWorksDialog
              open={howOpen}
              careerName={active.name}
              onClose={() => setHowOpen(false)}
              onStart={() => void goToCheck(active.careerId)}
            />
          </>
        ) : (
          <>
            <ChooseCareerPanel
              careers={careers}
              value={exploredId}
              onChange={setExplored}
              onStart={() => exploredId && void goToCheck(exploredId)}
            />
            <HowItWorksCard />
          </>
        )}
      </div>

      <CareerPickerDialog
        open={pickerOpen}
        careers={careers}
        initialCareerId={others.find((career) => career.reviewed)?.careerId ?? null}
        onClose={() => setPickerOpen(false)}
        onConfirm={(careerId) => {
          setPickerOpen(false);
          const chosen = careers.find((career) => career.careerId === careerId);
          if (chosen) open(chosen);
        }}
      />
    </>
  );
}
