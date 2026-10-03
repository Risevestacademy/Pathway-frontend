import { useEffect } from "react";
import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { CloudOff } from "lucide-react";
import * as Sentry from "@sentry/react";
import { Button } from "../../../components/ui/Button";
import StateMessage from "../../../components/StateMessage";
import RoadmapPage from "./RoadmapPage";

/** Shown when a roadmap request fails for a reason other than "not found". */
export default function RoadmapError({ error }: ErrorComponentProps) {
  const router = useRouter();

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <RoadmapPage>
      <StateMessage
        icon={CloudOff}
        variant="error"
        title="We couldn’t load this roadmap"
        body="Something went wrong on our side or with your connection. Please try again."
        action={
          // Re-runs the route loaders and resets this error boundary.
          <Button onClick={() => router.invalidate()}>Try again</Button>
        }
      />
    </RoadmapPage>
  );
}
