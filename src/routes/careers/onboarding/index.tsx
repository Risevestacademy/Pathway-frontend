import { createFileRoute, useNavigate } from "@tanstack/react-router";
import LevelSelect from "../../../features/catalog/components/LevelSelect";
import { useSession } from "../../../lib/stores/session";

export const Route = createFileRoute("/careers/onboarding/")({
  component: OnboardingIndex,
});

function OnboardingIndex() {
  const navigate = useNavigate();
  const { level } = useSession();

  const handleContinue = () => {
    if (level) {
      navigate({ to: "/careers/onboarding/about" });
    }
  };

  return (
    <main>
      <LevelSelect onContinue={handleContinue} />
    </main>
  );
}