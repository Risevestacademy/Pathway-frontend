import { Button } from "../../../components/ui/Button";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { Modal } from "../../../components/ui/Modal";
import { useSignOut } from "../hooks/useSignOut";

/** Confirms before signing out, opened from the account menu. */
export function SignOutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const signOut = useSignOut();

  const close = () => {
    if (signOut.isPending) return;
    onClose();
    signOut.reset();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Sign out of Pathway?"
      description="Your progress is saved. Sign in again any time to pick up where you left off."
      className="max-w-130"
    >
      {signOut.isError && (
        <p role="alert" className="text-sm leading-5 text-danger-700">
          We couldn’t sign you out. Check your connection and try again.
        </p>
      )}
      <div className="flex gap-3">
        <Button isPrimary={false} className="flex-1" onClick={close}>
          Cancel
        </Button>
        <Button
          className="flex-1"
          disabled={signOut.isPending}
          onClick={() => signOut.mutate()}
        >
          {signOut.isPending && <LoadingSpinner className="size-4" />}
          {signOut.isPending ? "Signing out" : "Sign out"}
        </Button>
      </div>
    </Modal>
  );
}
