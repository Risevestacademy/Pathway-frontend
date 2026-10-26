import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, SearchX } from "lucide-react";
import type { ReactNode } from "react";
import StateMessage from "@/components/StateMessage";
import { Button } from "@/components/ui/Button";
import { BackLink } from "@/features/skillCheck/components/BackLink";
import type { Career } from "@/types/career.types";
import { useCareer } from "../hooks/useCareer";
import CareerFrame from "./careerFrame";
import DetailSkeleton from "./detailSkeleton";
import { useEffect } from "react";
import { analytics } from "@/lib/monitoring/events";
import { isAxiosError } from "axios";
import * as Sentry from "@sentry/react";

export default function CareerLoader({
  careerId,
  children,
}: {
  careerId: string;
  children: (career: Career) => ReactNode;
}) {
  const {
    data: career,
    isPending,
    isError,
    error,
    refetch,
  } = useCareer(careerId);
  const navigate = useNavigate();

  useEffect(() => {
    if (!career) return;

    analytics.trackFeature.careerViewed(
      career.id,
      career.title,
      career.interest ?? "",
      career.level ?? "",
    );
  }, [career]);

  useEffect(() => {
    if (isError && !isAxiosError(error)) {
      Sentry.captureException(error);
    }
  }, [error, isError]);

  if (isPending) return <DetailSkeleton />;

  if (isError) {
    return (
      <CareerFrame>
        <BackLink to="/careers" label="All careers" />
        <StateMessage
          icon={AlertTriangle}
          variant="error"
          title="We couldn’t load this career"
          body="Something went wrong while loading the career details. Please try again."
          action={<Button onClick={() => refetch()}>Try again</Button>}
        />
      </CareerFrame>
    );
  }

  if (!career) {
    return (
      <CareerFrame>
        <BackLink to="/careers" label="All careers" />
        <StateMessage
          icon={SearchX}
          title="This career isn't available"
          body="It may have been removed from the catalogue."
          action={
            <Button
              isPrimary={false}
              onClick={() => navigate({ to: "/careers" })}
            >
              Browse careers
            </Button>
          }
        />
      </CareerFrame>
    );
  }

  return <CareerFrame>{children(career)}</CareerFrame>;
}
