import { createFileRoute, useNavigate } from "@tanstack/react-router";
import LevelSelect from "../../../features/catalog/components/LevelSelect";
import { useSession } from "../../../lib/stores/session";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { onboardingOptionsQuery } from "../../../features/catalog/hooks/useOnboardingOptions";


export const Route = createFileRoute("/careers/onboarding/")({
  component: OnboardingIndex,
});

function OnboardingIndex() {
  const navigate = useNavigate();
  const { level } = useSession();

  const queryClient = useQueryClient();
  useEffect(() => {
    void queryClient.prefetchQuery(onboardingOptionsQuery);
  }, [queryClient]);

  const handleContinue = () => {
    if (level) {
      navigate({ to: "/careers/onboarding/about" });
    }
  };

  return <LevelSelect onContinue={handleContinue} />;
}