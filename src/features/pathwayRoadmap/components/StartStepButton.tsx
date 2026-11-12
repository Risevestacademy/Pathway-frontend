import { useNavigate } from "@tanstack/react-router";
import { LinkButton } from "../../../components/ui/Button";
import StartTrackingButton from "../../progress/components/StartTrackingButton";

/**
 * Starts (or carries on with) a step by opening the career's resources. When the
 * career isn't their active pathway yet, it makes it active first, asking before
 * it replaces another active pathway.
 */
export function StartStepButton({
  careerId,
  stepNumber,
  started,
  activation,
}: {
  careerId: string;
  stepNumber: number;
  /** Whether they have already marked any step of this pathway done. */
  started: boolean;
  activation?: { careerTitle: string; activeCareerTitle: string | null };
}) {
  const navigate = useNavigate();
  const label = `${started ? "Continue" : "Start"} step ${stepNumber}`;

  if (activation) {
    return (
      <StartTrackingButton
        careerId={careerId}
        careerTitle={activation.careerTitle}
        activeCareerTitle={activation.activeCareerTitle}
        label={label}
        onStarted={() =>
          void navigate({ to: "/my-pathway/$careerId/resources", params: { careerId } })
        }
      />
    );
  }

  return (
    <LinkButton to="/my-pathway/$careerId/resources" params={{ careerId }}>
      {label}
    </LinkButton>
  );
}
