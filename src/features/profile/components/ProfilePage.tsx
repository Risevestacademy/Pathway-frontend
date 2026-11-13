import clsx from "clsx";
import { useState } from "react";
import type { ReactNode } from "react";
import { Skeleton } from "../../../components/ui/Skeleton";
import { PageHeading } from "../../skillCheck/components/PageHeading";
import { SkillButton } from "../../skillCheck/components/SkillButton";
import { useProfile } from "../hooks/useProfileData";
import { ActivePathwayCard } from "./ActivePathwayCard";
import { LevelCard } from "./LevelCard";
import { NameCard } from "./NameCard";
import { ComingSoonSection } from "./ProfileSection";

const COMING_SOON = [
  { title: "Education", description: "Your level of study, field and school." },
  { title: "Experience", description: "Internships, volunteering and projects all count." },
  {
    title: "Skills",
    description: "Skills you believe you have. We use them to show gaps in your pathway.",
  },
  {
    title: "Career interests",
    description:
      "Pick the careers you are curious about. We use them to suggest careers and openings.",
  },
];

function Dimmable({
  dimmed,
  className,
  children,
}: {
  dimmed: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      inert={dimmed}
      className={clsx(
        "transition-opacity duration-200 ease-out motion-reduce:transition-none",
        dimmed && "opacity-60",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading your profile"
      className="grid gap-4 lg:grid-cols-[24rem_minmax(0,1fr)]"
    >
      <div className="flex flex-col gap-4">
        <Skeleton className="h-64 rounded-[24px]" />
        <Skeleton className="h-44 rounded-[24px]" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-32 rounded-[20px]" />
        <Skeleton className="h-28 rounded-[20px]" />
        <Skeleton className="h-28 rounded-[20px]" />
      </div>
    </div>
  );
}

export function ProfilePage() {
  const profile = useProfile();
  const [editingName, setEditingName] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Profile"
        description="Only you can see this. It helps us suggest careers and show your skill gaps."
      />
      {profile.isPending ? (
        <ProfileSkeleton />
      ) : profile.isError ? (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-[20px] border border-grey-100 p-6">
          <p className="text-base leading-6 text-ink">We could not load your profile.</p>
          <SkillButton onClick={() => void profile.refetch()}>Try again</SkillButton>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[24rem_minmax(0,1fr)] lg:items-start">
          <div className="grid gap-4 md:grid-cols-2 md:items-start lg:grid-cols-1">
            <NameCard
              profile={profile.data}
              editing={editingName}
              onEdit={() => setEditingName(true)}
              onDone={() => setEditingName(false)}
            />
            <Dimmable dimmed={editingName}>
              <ActivePathwayCard />
            </Dimmable>
          </div>
          <Dimmable dimmed={editingName} className="flex flex-col gap-4">
            <LevelCard />
            {COMING_SOON.map((section) => (
              <ComingSoonSection key={section.title} {...section} />
            ))}
          </Dimmable>
        </div>
      )}
    </div>
  );
}