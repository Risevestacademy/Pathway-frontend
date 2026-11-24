// import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Modal } from "@/components/ui/Modal";
import InputNewEmail from "./InputNewEmail";
import { getRouteApi } from "@tanstack/react-router";
import VerifyEmailChange from "./VerifyEmailChange";

const routeApi = getRouteApi("/_protected/settings");

export default function ChangeEmailDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const close = () => {
    onClose();
  };
  const { "verify-email": verifyEmail } = routeApi.useSearch();

  return (
    <Modal
      open={open}
      onClose={close}
      title={verifyEmail ? "Check your inbox" : "Change your email"}
      description={
        verifyEmail
          ? `We sent a 6-dgit code to ${verifyEmail}. Enter it to confirm your new email.`
          : "We will send a code to the new address to confirm it"
      }
    >
      {verifyEmail ? (
        <VerifyEmailChange onClose={close} />
      ) : (
        <InputNewEmail onClose={close} />
      )}
    </Modal>
  );
}
