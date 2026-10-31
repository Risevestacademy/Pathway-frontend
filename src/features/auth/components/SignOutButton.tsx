import clsx from "clsx";
import { ExitRegular } from "@mingcute/react/core-regular";
import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { Modal } from "../../../components/ui/Modal";
import { useSignOut } from "../hooks/useSignOut";

/** Top nav button, beside Feedback. Asks first, since the two sit side by side. */
export function SignOutButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const signOut = useSignOut();

  const close = () => {
    if (signOut.isPending) return;
    setOpen(false);
    signOut.reset();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={clsx(
          "focus-ring flex h-10 items-center gap-1.5 rounded-lg border border-b-4 border-grey-100 bg-surface px-3 text-base leading-5 font-medium whitespace-nowrap text-grey-600 transition-colors duration-200 ease-out hover:bg-grey-50 motion-reduce:transition-none",
          className,
        )}
      >
        <ExitRegular aria-hidden size={18} className="shrink-0 text-grey-500" />
        <span className="sr-only sm:not-sr-only">Sign out</span>
      </button>

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
    </>
  );
}
