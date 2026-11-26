import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export default function DeleteAccountDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [confirmText, setConfirmText] = useState<string>("");
  const [errorText, setErrorText] = useState<string | null>();

  const close = () => {
    onClose();
  };

  const handleDelete = () => {
    if (!confirmText || confirmText !== "DELETE") {
      setErrorText("Invalid input. You must type 'DELETE'.");
      return;
    }
    setErrorText(null);
    // call api implementation
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Delete your account?"
      description="This permanently removes your profile, pathways, progress and saved careers. We cannot get them back for you."
    >
      <div className="flex flex-col gap-6">
        <p className="p-2.5 rounded-lg bg-canvas text-[14px] leading-5 text-grey-600">
          Want a copy first? Use Download my data on the Privacy and data page
          before you delete.
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 font-medium">
            <p>Type DELETE to confirm</p>
            <input
              type="text"
              name="confirm delete"
              placeholder="DELETE"
              required
              aria-required
              onChange={(e) => setConfirmText(e.target.value)}
              value={confirmText}
              className="border rounded-lg px-4 py-2.75 outline-none border-grey-200 placeholder:text-ink-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 font-medium"
            />
            {errorText && (
              <p role="alert" className="text-[14px] text-danger-600">
                {errorText}
              </p>
            )}
          </div>

          <div className="flex gap-3 mt-2">
            <Button isPrimary={false} onClick={close}>
              Cancel
            </Button>
            <Button
              isPrimary={false}
              className="bg-danger-600! border-danger-700! text-white hover:bg-danger-700 hover:border-danger-700"
              onClick={handleDelete}
              disabled
            >
              Delete my account
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
