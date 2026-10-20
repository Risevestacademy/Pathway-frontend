import { Link } from "@tanstack/react-router";
import { Button } from "../../../components/ui/Button";
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
        <Button isPrimary={false} size="lg" className="flex-1" onClick={onKeepGoing}>
          Keep going
        </Button>
        <Link
          to="/skill-check"
          className="focus-ring inline-flex flex-1 items-center justify-center rounded-[16px] border-b-4 border-brand-700 bg-brand-600 px-4 py-3 text-base leading-5 font-semibold text-white transition-colors hover:bg-brand-700 motion-reduce:transition-none"
        >
          Back to Skill check
        </Link>
      </div>
    </Modal>
  );
}
