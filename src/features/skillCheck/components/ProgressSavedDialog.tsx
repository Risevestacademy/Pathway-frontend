import { SkillButton, SkillLink } from "./SkillButton";
import { Modal } from "../../../components/ui/Modal";

export function ProgressSavedDialog({
  open,
  answered,
  total,
  onKeepGoing,
}: {
  open: boolean;
  answered: number;
  total: number;
  onKeepGoing: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onKeepGoing}
      title="Progress saved"
      description={`You have answered ${answered} of ${total} skills. Pick up where you left off any time from My Pathway, in Skill check.`}
      className="max-w-130"
    >
      <div className="flex gap-3">
        <SkillButton isPrimary={false} className="flex-1" onClick={onKeepGoing}>
          Keep going
        </SkillButton>
        <SkillLink to="/skill-check" className="flex-1">
          Back to Skill check
        </SkillLink>
      </div>
    </Modal>
  );
}
