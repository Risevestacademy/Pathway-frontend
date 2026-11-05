import { useRouterState } from "@tanstack/react-router";
import { Button, LinkButton } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCareerProgress } from "@/features/progress/hooks/useCareerProgress";
import StartTrackingButton from "@/features/progress/components/StartTrackingButton";
import type { Career } from "@/types/career.types";
import { COMPARE } from "../compare.copy";
import { bodyText } from "./CompareCells";

export default function StartAction({ career }: { career: Career }) {
  const { progress, retry } = useCareerProgress(career.id);
  const href = useRouterState({ select: (state) => state.location.href });

  if (!career.roadmapId) {
    return <p className={bodyText}>{COMPARE.result.roadmapSoon}</p>;
  }

  switch (progress.kind) {
    case "loading":
      return (
        <div role="status" aria-label={`Checking your progress on ${career.title}`}>
          <Skeleton className="h-11 w-44 rounded-2xl" />
        </div>
      );

    case "error":
      return (
        <div role="alert" className="flex flex-col items-start gap-2">
          <p className="text-sm text-ink">We couldn’t load your progress.</p>
          <Button isPrimary={false} onClick={retry}>
            Try again
          </Button>
        </div>
      );

    case "signed-out":
      return (
        <LinkButton to="/login" search={{ redirect: href }}>
          Sign in to start {career.title}
        </LinkButton>
      );

    case "untracked":
      return (
        <StartTrackingButton
          careerId={career.id}
          careerTitle={career.title}
          activeCareerTitle={progress.activeCareerTitle}
          label={`Start ${career.title}`}
        />
      );

    case "inactive":
      return (
        <StartTrackingButton
          careerId={career.id}
          careerTitle={career.title}
          activeCareerTitle={progress.activeCareerTitle}
          label={`Make ${career.title} active`}
        />
      );

    case "active":
      return (
        <LinkButton to="/careers/$careerId/roadmap" params={{ careerId: career.id }}>
          Continue {career.title}
        </LinkButton>
      );
  }
}