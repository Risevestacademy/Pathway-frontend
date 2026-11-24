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
        <p className="p-2.5 rounded-lg bg-[#f6f6f6] text-[14px] leading-5 text-[#474747]">
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
              className="border rounded-lg px-4 py-2.75 outline-none border-[#e4e4e4] placeholder:text-ink-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 font-medium"
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
              className="bg-[#c72e2e]! border-[#8c1a1a]! text-white hover:bg-[#8c1a1a] hover:border-[#8c1a1a]"
              onClick={handleDelete}
            >
              Delete account
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
