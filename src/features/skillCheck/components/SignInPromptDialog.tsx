import { Modal } from "../../../components/ui/Modal";
import { SkillButton, SkillLink } from "./SkillButton";

export function SignInPromptDialog({
  open,
  onClose,
  redirectTo,
}: {
  open: boolean;
  onClose: () => void;
  redirectTo: string;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Sign in to check your skills"
      description="Your result is saved to your pathway, so you need an account. Browsing careers stays open to everyone."
      className="max-w-130"
    >
      <div className="flex gap-3">
        <SkillLink to="/login" search={{ redirect: redirectTo }} isPrimary={false} className="flex-1">
          Create account
        </SkillLink>
        <SkillLink to="/login" search={{ redirect: redirectTo }} className="flex-1">
          Sign in
        </SkillLink>
      </div>
      <SkillButton isPrimary={false} className="self-start" onClick={onClose}>
        Not now
      </SkillButton>
    </Modal>
  );
}
