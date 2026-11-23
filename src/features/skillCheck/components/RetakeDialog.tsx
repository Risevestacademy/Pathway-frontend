import { Modal } from "../../../components/ui/Modal";
import { SkillButton } from "./SkillButton";

export function RetakeDialog({
  open,
  careerName,
  pending,
  error,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  careerName: string;
  pending: boolean;
  error: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={`Retake the ${careerName} skill check?`}
      description="This clears your answers, ratings and starting point for this pathway. Your completed steps stay as they are."
      className="max-w-130"
    >
      {error && (
        <p role="alert" className="text-sm leading-5 text-danger-700">
          Your answers were not cleared. Try again.
        </p>
      )}
      <div className="flex gap-3">
        <SkillButton isPrimary={false} className="flex-1" onClick={onCancel}>
          Cancel
        </SkillButton>
        <SkillButton className="flex-1" disabled={pending} onClick={onConfirm}>
          {pending ? "Clearing" : "Clear and start again"}
        </SkillButton>
      </div>
    </Modal>
  );
}
