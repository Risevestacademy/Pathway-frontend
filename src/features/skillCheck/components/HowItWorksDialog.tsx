import { ArrowRightRegular } from "@mingcute/react/core-regular";
import { SkillButton } from "./SkillButton";
import { Modal } from "../../../components/ui/Modal";
import { DIALOG_STEPS } from "../skillCheck.copy";
import { StepNumberList } from "./StepNumberList";

export function HowItWorksDialog({
  open,
  careerName,
  onClose,
  onStart,
}: {
  open: boolean;
  careerName: string;
  onClose: () => void;
  onStart: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} compact title={`Check your skills for ${careerName}`}>
      <StepNumberList steps={DIALOG_STEPS} />
      <div className="flex gap-3">
        <SkillButton isPrimary={false} className="flex-1" onClick={onClose}>
          Not now
        </SkillButton>
        <SkillButton className="flex-1" onClick={onStart}>
          Start
          <ArrowRightRegular aria-hidden className="size-5" />
        </SkillButton>
      </div>
    </Modal>
  );
}
