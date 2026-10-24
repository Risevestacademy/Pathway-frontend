import { SkillButton } from "./SkillButton";
import { Modal } from "../../../components/ui/Modal";

export function SwitchPathwayDialog({
  open,
  targetName,
  currentName,
  pending,
  error,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  targetName: string;
  currentName: string | null;
  pending: boolean;
  error: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={`Switch your active pathway to ${targetName}?`}
      description={
        currentName
          ? `Your progress on ${currentName} is saved. You can come back to it any time.`
          : "You can switch back to another pathway any time."
      }
      className="max-w-130"
    >
      {error && (
        <p role="alert" className="text-sm leading-5 text-danger-700">
          The switch did not save. Try again.
        </p>
      )}
      <div className="flex gap-3">
        <SkillButton isPrimary={false} className="flex-1" onClick={onCancel}>
          Cancel
        </SkillButton>
        <SkillButton className="flex-1" disabled={pending} onClick={onConfirm}>
          {pending ? "Switching" : "Switch pathway"}
        </SkillButton>
      </div>
    </Modal>
  );
}
