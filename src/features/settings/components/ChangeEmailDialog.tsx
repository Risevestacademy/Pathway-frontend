import { useState } from "react";
// import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Modal } from "@/components/ui/Modal";
import InputNewEmail from "./InputNewEmail";
import VerifyEmailChange from "./VerifyEmailChange";
import { useAuthStore } from "@/lib/stores/authStore";
import { getPendingEmailChange } from "../pendingEmailChange";

export default function ChangeEmailDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const close = () => {
    setPendingEmail(null);
    onClose();
  };
  const userId = useAuthStore((state) => state.user?.id);
  const [pendingEmail, setPendingEmail] = useState(() =>
    userId ? getPendingEmailChange(userId) : null,
  );
  const verifyEmail = pendingEmail;

  return (
    <Modal
      open={open}
      onClose={close}
      title={verifyEmail ? "Check your inbox" : "Change your email"}
      description={
        verifyEmail
          ? `We sent a 6-digit code to ${verifyEmail}. Enter it to confirm your new email.`
          : "We will send a code to the new address to confirm it"
      }
    >
      {verifyEmail ? (
        <VerifyEmailChange onClose={close} />
      ) : (
        <InputNewEmail onCodeSent={setPendingEmail} onClose={close} />
      )}
    </Modal>
  );
}
