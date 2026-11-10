import OpportunitiesFrame from "./OpportunitiesFrame";
import { BackLinkTo } from "@/features/skillCheck/components/BackLink";
import StateMessage from "@/components/StateMessage";
import { AlertTriangle, SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter, useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";

export default function ErrorComponent({ error }: { error: unknown }) {
  if (isAxiosError(error) && error.response) {
    if (error.response.status === 404) {
      return <NotFound />;
    }
  }

  return <UnknownError />;
}

export function UnknownError() {
  const router = useRouter();
  return (
    <OpportunitiesFrame>
      <BackLinkTo label="Back" to="/opportunities" />
      <StateMessage
        icon={AlertTriangle}
        variant="error"
        title="We couldn't load this career"
        body="Something went wrong while loading the career details. Please try again."
        action={<Button onClick={() => router.invalidate()}>Try again</Button>}
      />
    </OpportunitiesFrame>
  );
}

export function NotFound() {
  const navigate = useNavigate();

  return (
    <OpportunitiesFrame>
      <BackLinkTo label="Back" to="/opportunities" />
      <StateMessage
        icon={SearchX}
        title="This opportunity isn't available"
        body="It may have been removed from the catalogue."
        action={
          <Button
            isPrimary={false}
            onClick={() => navigate({ to: "/opportunities" })}
          >
            Browse opportunities
          </Button>
        }
      />
    </OpportunitiesFrame>
  );
}
