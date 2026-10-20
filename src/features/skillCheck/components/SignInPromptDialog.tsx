import { Link } from "@tanstack/react-router";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";

const linkBase =
  "focus-ring inline-flex flex-1 items-center justify-center rounded-[16px] px-4 py-3 text-base leading-5 font-semibold transition-colors motion-reduce:transition-none";

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
        <Link
          to="/login"
          search={{ redirect: redirectTo }}
          className={`${linkBase} border border-b-4 border-grey-100 bg-surface text-grey-600 hover:bg-grey-50`}
        >
          Create account
        </Link>
        <Link
          to="/login"
          search={{ redirect: redirectTo }}
          className={`${linkBase} border-b-4 border-brand-700 bg-brand-600 text-white hover:bg-brand-700`}
        >
          Sign in
        </Link>
      </div>
      <Button isPrimary={false} className="self-start" onClick={onClose}>
        Not now
      </Button>
    </Modal>
  );
}
